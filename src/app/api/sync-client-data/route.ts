import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { getValidAccessToken } from "@/lib/channel-tokens";
import { cacheClientData } from "@/lib/client-data-cache";
import type { CachedChannelData, CachedClientData } from "@/lib/client-data-cache";
import { getChannelStatsById, getRevenueData } from "@/lib/youtube";
import { syncChannelToBackend } from "@/lib/backend-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

interface StoredUser {
  id: string;
  name: string;
  email: string;
  channels: string[];
  status: "active" | "inactive";
}

export async function GET(request: Request) {
  // Allow admin or cron calls
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const cronSecret = url.searchParams.get("secret");
  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email?.toLowerCase() || "");
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (!isAdmin && !isCron) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await kv.get<StoredUser[]>("bainsla_users");
    if (!users || users.length === 0) {
      return Response.json({ message: "No users found", synced: 0 });
    }

    const results: Array<{ email: string; status: string; channels: number; revenue: number }> = [];

    for (const user of users) {
      if (user.status !== "active" || user.channels.length === 0) {
        results.push({ email: user.email, status: "skipped", channels: 0, revenue: 0 });
        continue;
      }

      try {
        // Find a valid token from any of this user's channels
        let validToken: string | null = null;
        for (const chId of user.channels) {
          const t = await getValidAccessToken(chId);
          if (t) { validToken = t; break; }
        }

        if (!validToken) {
          results.push({ email: user.email, status: "no_token", channels: user.channels.length, revenue: 0 });
          continue;
        }

        // Fetch channel stats using stored token
        const channelStats = await getChannelStatsById(validToken, user.channels);

        // Fetch revenue data (last 28 days)
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 2); // YouTube data is 2 days behind
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 28);
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];

        // Fetch revenue per channel
        let totalRevenue = 0;
        let totalViews = 0;
        let totalSubscribers = 0;
        const cachedChannels: CachedChannelData[] = [];

        for (const ch of channelStats) {
          const chId = (ch as Record<string, unknown>).id as string || "";
          const snippet = (ch as Record<string, unknown>).snippet as Record<string, unknown> | undefined;
          const statistics = (ch as Record<string, unknown>).statistics as Record<string, unknown> | undefined;

          const subs = Number(statistics?.subscriberCount || 0);
          const views = Number(statistics?.viewCount || 0);
          const videoCount = Number(statistics?.videoCount || 0);
          const title = (snippet?.title as string) || chId;
          const thumbnails = snippet?.thumbnails as Record<string, Record<string, string>> | undefined;
          const thumb = thumbnails?.default?.url || "";

          totalSubscribers += subs;
          totalViews += views;

          // Try to get revenue for this channel
          let channelRevenue = 0;
          let channelRpm = 0;
          try {
            const chToken = await getValidAccessToken(chId) || validToken;
            const revData = await getRevenueData(chToken, startStr, endStr);
            if (revData?.rows?.length && revData.columnHeaders) {
              const headers = (revData.columnHeaders as Array<{ name?: string | null }>).map(h => h.name || "");
              const revIdx = headers.indexOf("estimatedRevenue");
              const viewIdx = headers.indexOf("views");
              if (revIdx !== -1) {
                channelRevenue = (revData.rows as Array<Array<string | number>>).reduce(
                  (s: number, r) => s + (Number(r[revIdx]) || 0), 0
                );
              }
              const analyticsViews = viewIdx !== -1
                ? (revData.rows as Array<Array<string | number>>).reduce(
                    (s: number, r) => s + (Number(r[viewIdx]) || 0), 0
                  )
                : 0;
              channelRpm = analyticsViews > 0 ? (channelRevenue / analyticsViews) * 1000 : 0;
            }
          } catch {
            // Revenue fetch failed for this channel, continue
          }

          totalRevenue += channelRevenue;

          cachedChannels.push({
            channelId: chId,
            channelTitle: title,
            thumbnail: thumb,
            subscribers: subs,
            views,
            videoCount,
            estimatedRevenue: Math.round(channelRevenue * 100) / 100,
            rpm: Math.round(channelRpm * 100) / 100,
            cpm: 0,
            lastUpdated: new Date().toISOString(),
          });
        }

        const clientData: CachedClientData = {
          userId: user.email,
          email: user.email,
          channels: cachedChannels,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalViews,
          totalSubscribers,
          lastUpdated: new Date().toISOString(),
        };

        await cacheClientData(user.email, clientData);

        // Sync channels to backend database (non-blocking)
        for (const ch of cachedChannels) {
          syncChannelToBackend({
            channelId: ch.channelId,
            title: ch.channelTitle,
            thumbnailUrl: ch.thumbnail,
            subscriberCount: ch.subscribers,
            videoCount: ch.videoCount,
            viewCount: ch.views,
          }).catch(() => {});
        }

        results.push({
          email: user.email,
          status: "synced",
          channels: cachedChannels.length,
          revenue: clientData.totalRevenue,
        });
      } catch (error) {
        results.push({
          email: user.email,
          status: `error: ${error instanceof Error ? error.message : "unknown"}`,
          channels: 0,
          revenue: 0,
        });
      }
    }

    return Response.json({
      message: "Sync complete",
      synced: results.filter(r => r.status === "synced").length,
      total: users.length,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: `Sync failed: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}

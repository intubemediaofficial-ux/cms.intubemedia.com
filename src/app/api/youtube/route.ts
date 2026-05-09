import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getChannelStats,
  getChannelStatsById,
  getChannelVideos,
  getAnalyticsData,
  getTrafficSources,
  getCountryData,
  getDemographics,
  getDeviceData,
  getRevenueData,
  getTopVideos,
  lookupChannel,
} from "@/lib/youtube";
import { getValidAccessToken, getTokenStatus } from "@/lib/channel-tokens";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "vijendrachoudhary95@gmail.com",
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json(
      { error: "No session found. Please log in again." },
      { status: 401 }
    );
  }

  const isAdminCredentials = !session.accessToken && ADMIN_EMAILS.includes(session.user?.email?.toLowerCase() || "");
  const isCredentialsLogin = !session.accessToken;

  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const startDate = url.searchParams.get("startDate") || getDefaultStartDate();
  const endDate = url.searchParams.get("endDate") || getDefaultEndDate();

  // Credentials login (admin or client) can access dashboardFull and lookupChannel via per-channel tokens
  if (!session.accessToken && !isAdminCredentials && !isCredentialsLogin) {
    return Response.json(
      {
        error: session.error === "RefreshAccessTokenError"
          ? "Session expired. Please log out and log in again."
          : "No access token. Please log out and sign in with Google again.",
        sessionError: session.error || null,
      },
      { status: 401 }
    );
  }

  try {
    // Credentials login (admin or client) can only access certain actions via per-channel tokens
    if (isCredentialsLogin && !["dashboardFull", "lookupChannel", "dashboard", "videos"].includes(action || "")) {
      return Response.json(
        { error: "This action requires Google OAuth login. Please sign in with Google.", needsGoogleAuth: true },
        { status: 401 }
      );
    }

    switch (action) {
      case "channels": {
        const channels = await getChannelStats(session.accessToken!);
        return Response.json({ data: channels });
      }
      case "videos": {
        const channelId = url.searchParams.get("channelId");
        if (!channelId)
          return Response.json({ error: "channelId required" }, { status: 400 });
        // Try using per-channel token first, then fall back to admin token
        let videoToken = session.accessToken;
        if (!videoToken) {
          const channelSpecificToken = await getValidAccessToken(channelId);
          if (channelSpecificToken) videoToken = channelSpecificToken;
        }
        if (!videoToken) {
          return Response.json({ error: "No token available for this channel. Please validate the channel token first." }, { status: 401 });
        }
        const videos = await getChannelVideos(videoToken, channelId);
        return Response.json({ data: videos });
      }
      case "analytics": {
        const data = await getAnalyticsData(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "traffic": {
        const data = await getTrafficSources(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "countries": {
        const data = await getCountryData(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "demographics": {
        const data = await getDemographics(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "devices": {
        const data = await getDeviceData(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "revenue": {
        const data = await getRevenueData(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "topVideos": {
        const data = await getTopVideos(
          session.accessToken!,
          startDate,
          endDate
        );
        return Response.json({ data });
      }
      case "lookupChannel": {
        const query = url.searchParams.get("query");
        if (!query)
          return Response.json({ error: "query required" }, { status: 400 });
        // For admin credentials login, try using any available per-channel token for lookup
        let lookupToken = session.accessToken;
        if (!lookupToken) {
          // Try to find any valid channel token to use for the lookup API call
          const { getValidAccessToken: getToken } = await import("@/lib/channel-tokens");
          // We need any token — iterate stored channel IDs from the query params
          const storedIds = url.searchParams.get("storedChannelIds")?.split(",").filter(Boolean) || [];
          for (const sid of storedIds) {
            const t = await getToken(sid);
            if (t) { lookupToken = t; break; }
          }
        }
        if (!lookupToken) {
          return Response.json({ error: "No token available for channel lookup. Please validate at least one channel token first." }, { status: 401 });
        }
        const results = await lookupChannel(lookupToken, query);
        return Response.json({ data: results });
      }
      case "dashboard": {
        if (!session.accessToken) {
          return Response.json({ error: "Google OAuth required for this action" }, { status: 401 });
        }
        const [channels, analyticsData, topVideosData] = await Promise.all([
          getChannelStats(session.accessToken),
          getAnalyticsData(
            session.accessToken,
            startDate,
            endDate,
            "views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,averageViewDuration",
            "month"
          ),
          getTopVideos(session.accessToken, startDate, endDate),
        ]);

        return Response.json({
          data: {
            channels,
            analytics: analyticsData,
            topVideos: topVideosData,
          },
        });
      }
      case "dashboardFull": {
        const prevStartDate = url.searchParams.get("prevStartDate") || startDate;
        const prevEndDate = url.searchParams.get("prevEndDate") || endDate;
        const channelIdsParam = url.searchParams.get("channelIds") || "";
        const channelIds = channelIdsParam
          ? channelIdsParam.split(",").filter(Boolean)
          : [];

        const performanceMetrics = "views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes";

        // For admin credentials login (no Google OAuth token), use per-channel tokens only
        const adminToken = session.accessToken;
        const hasAdminToken = !!adminToken;

        // Fetch channel stats for specific added channels
        // For credentials login, use any available per-channel token
        let channelLookupToken = adminToken;
        if (!channelLookupToken) {
          for (const cid of channelIds) {
            const t = await getValidAccessToken(cid);
            if (t) { channelLookupToken = t; break; }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let channelsPromise: Promise<any[]>;
        if (channelIds.length > 0 && channelLookupToken) {
          channelsPromise = getChannelStatsById(channelLookupToken, channelIds);
        } else if (channelLookupToken) {
          channelsPromise = getChannelStats(channelLookupToken);
        } else {
          channelsPromise = Promise.resolve([]);
        }

        // Check if user's own channel is among the added channels
        let myChannelIds: string[] = [];
        let hasOwnChannel = false;
        if (hasAdminToken) {
          const myChannels = await getChannelStats(adminToken);
          myChannelIds = myChannels.map(
            (ch: { id?: string | null }) => ch.id
          ).filter(Boolean) as string[];
          hasOwnChannel = channelIds.length === 0 ||
            myChannelIds.some((id) => channelIds.includes(id));
        }

        // Get yesterday's date for last day revenue
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2); // YouTube data is ~2 days delayed
        const lastDayDate = yesterday.toISOString().split("T")[0];

        // Collect per-channel tokens for channels that have valid OAuth tokens
        const channelTokenMap: Record<string, string> = {};
        for (const cid of channelIds) {
          const tokenStatus = await getTokenStatus(cid);
          if (tokenStatus === "valid" || tokenStatus === "expired") {
            const token = await getValidAccessToken(cid);
            if (token) channelTokenMap[cid] = token;
          }
        }
        const tokenizedChannelIds = Object.keys(channelTokenMap);
        const hasAnyToken = hasOwnChannel || tokenizedChannelIds.length > 0;

        // Fetch analytics using admin token (for own channel) — only if admin has Google OAuth
        const [
          channels,
          currentPerformance,
          prevPerformance,
          currentRevenue,
          prevRevenue,
          dailyRevenue,
          topVideosByViews,
          lastDayRevenueData,
          channelRevenueData,
        ] = await Promise.all([
          channelsPromise,
          hasOwnChannel && hasAdminToken
            ? getAnalyticsData(adminToken, startDate, endDate, performanceMetrics, "")
            : Promise.resolve(null),
          hasOwnChannel && hasAdminToken
            ? getAnalyticsData(adminToken, prevStartDate, prevEndDate, performanceMetrics, "")
            : Promise.resolve(null),
          hasOwnChannel && hasAdminToken
            ? getRevenueData(adminToken, startDate, endDate).catch(() => null)
            : Promise.resolve(null),
          hasOwnChannel && hasAdminToken
            ? getRevenueData(adminToken, prevStartDate, prevEndDate).catch(() => null)
            : Promise.resolve(null),
          hasOwnChannel && hasAdminToken
            ? getAnalyticsData(adminToken, startDate, endDate, "estimatedRevenue", "day").catch(() => null)
            : Promise.resolve(null),
          hasOwnChannel && hasAdminToken
            ? getTopVideos(adminToken, startDate, endDate)
            : Promise.resolve({ analytics: null, videos: [] }),
          hasOwnChannel && hasAdminToken
            ? getAnalyticsData(adminToken, lastDayDate, lastDayDate, "estimatedRevenue,views", "").catch(() => null)
            : Promise.resolve(null),
          hasOwnChannel && hasAdminToken
            ? getAnalyticsData(adminToken, startDate, endDate, "estimatedRevenue,views", "").catch(() => null)
            : Promise.resolve(null),
        ]);

        // Fetch analytics for each tokenized channel using their own OAuth tokens
        const perChannelAnalytics: Record<string, {
          performance: Record<string, unknown> | null;
          prevPerformance: Record<string, unknown> | null;
          revenue: Record<string, unknown> | null;
          prevRevenue: Record<string, unknown> | null;
          dailyRevenue: Record<string, unknown> | null;
          revenueViews: Record<string, unknown> | null;
        }> = {};

        for (const [cid, token] of Object.entries(channelTokenMap)) {
          // Skip if this is the admin's own channel (already fetched above)
          if (myChannelIds.includes(cid)) continue;
          try {
            const [perf, prevPerf, rev, prevRev, daily, revViews] = await Promise.all([
              getAnalyticsData(token, startDate, endDate, performanceMetrics, "").catch(() => null),
              getAnalyticsData(token, prevStartDate, prevEndDate, performanceMetrics, "").catch(() => null),
              getRevenueData(token, startDate, endDate).catch(() => null),
              getRevenueData(token, prevStartDate, prevEndDate).catch(() => null),
              getAnalyticsData(token, startDate, endDate, "estimatedRevenue", "day").catch(() => null),
              getAnalyticsData(token, startDate, endDate, "estimatedRevenue,views", "").catch(() => null),
            ]);
            perChannelAnalytics[cid] = {
              performance: perf as Record<string, unknown> | null,
              prevPerformance: prevPerf as Record<string, unknown> | null,
              revenue: rev as Record<string, unknown> | null,
              prevRevenue: prevRev as Record<string, unknown> | null,
              dailyRevenue: daily as Record<string, unknown> | null,
              revenueViews: revViews as Record<string, unknown> | null,
            };
          } catch {
            // Token might be invalid, skip
          }
        }

        // Build per-channel revenue map
        const channelRevenueMap: Record<string, { revenue: number; views: number; rpm: number }> = {};

        // Admin's own channel revenue
        if (channelRevenueData?.rows?.length && channelRevenueData.columnHeaders) {
          const headers = (channelRevenueData.columnHeaders as Array<{ name?: string | null }>).map((h) => h.name || "");
          const revIdx = headers.indexOf("estimatedRevenue");
          const viewsIdx = headers.indexOf("views");
          const totalRevenue = revIdx !== -1 ? Number(channelRevenueData.rows[0][revIdx]) || 0 : 0;
          const totalViews = viewsIdx !== -1 ? Number(channelRevenueData.rows[0][viewsIdx]) || 0 : 0;
          for (const myId of myChannelIds) {
            if (channelIds.length === 0 || channelIds.includes(myId)) {
              channelRevenueMap[myId] = {
                revenue: totalRevenue,
                views: totalViews,
                rpm: totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0,
              };
            }
          }
        }

        // Per-channel token revenue
        for (const [cid, data] of Object.entries(perChannelAnalytics)) {
          const revData = data.revenueViews as { rows?: unknown[][]; columnHeaders?: Array<{ name?: string | null }> } | null;
          if (revData?.rows?.length && revData.columnHeaders) {
            const headers = revData.columnHeaders.map((h) => h.name || "");
            const revIdx = headers.indexOf("estimatedRevenue");
            const viewsIdx = headers.indexOf("views");
            const rev = revIdx !== -1 ? Number(revData.rows[0][revIdx]) || 0 : 0;
            const views = viewsIdx !== -1 ? Number(revData.rows[0][viewsIdx]) || 0 : 0;
            channelRevenueMap[cid] = {
              revenue: rev,
              views,
              rpm: views > 0 ? (rev / views) * 1000 : 0,
            };
          }
        }

        // Extract last day revenue
        let lastDayRevenue = 0;
        if (lastDayRevenueData?.rows?.length && lastDayRevenueData.columnHeaders) {
          const headers = (lastDayRevenueData.columnHeaders as Array<{ name?: string | null }>).map((h) => h.name || "");
          const revIdx = headers.indexOf("estimatedRevenue");
          if (revIdx !== -1) {
            lastDayRevenue = Number(lastDayRevenueData.rows[0][revIdx]) || 0;
          }
        }

        return Response.json({
          data: {
            channels,
            currentPerformance,
            prevPerformance,
            currentRevenue,
            prevRevenue,
            dailyRevenue,
            topVideos: topVideosByViews,
            hasOwnChannel: hasAnyToken,
            channelRevenueMap,
            lastDayRevenue,
            lastDayDate,
            perChannelAnalytics,
            tokenizedChannels: tokenizedChannelIds,
          },
        });
      }
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    let message = "YouTube API error";
    if (error instanceof Error) {
      message = error.message;
    }
    const errorObj = error as { response?: { data?: { error?: { message?: string; code?: number } } }; code?: number };
    if (errorObj?.response?.data?.error?.message) {
      message = errorObj.response.data.error.message;
    }
    console.error("YouTube API error:", JSON.stringify(error, null, 2));
    return Response.json({ error: message, action }, { status: 500 });
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split("T")[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split("T")[0];
}

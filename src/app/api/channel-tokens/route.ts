import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getChannelToken,
  setChannelToken,
  deleteChannelToken,
  getTokenStatus,
  isKVConfigured,
} from "@/lib/channel-tokens";
import { kv } from "@/lib/redis";
import { permanentRemoveFromBackend, expireAllTokensOnBackend } from "@/lib/backend-sync";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdminUser = isAdmin(session.user.email);

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "generateInviteLink": {
      if (!isAdminUser) {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
      const channelId = url.searchParams.get("channelId");
      const channelTitle = url.searchParams.get("channelTitle") || "";
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return Response.json({ error: "Google Client ID not configured" }, { status: 500 });
      }

      // Use x-forwarded-host for correct public URL on Vercel
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
      const requestUrl = new URL(request.url);
      const host = forwardedHost || requestUrl.host;
      const protocol = forwardedHost ? forwardedProto : requestUrl.protocol.replace(":", "");
      const redirectUri = `${protocol}://${host}/callback`;
      const state = channelId;

      const scopes = [
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
        "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
      ];

      // Build scope string with literal + separator (not encoded) — matches GMJ format
      const scopeString = scopes.map(s => encodeURIComponent(s)).join("+");

      const oauthUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `access_type=offline` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&prompt=consent` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${scopeString}` +
        `&state=${state}`;

      return Response.json({
        data: {
          oauthUrl,
          channelId,
          channelTitle,
          state,
          redirectUri,
        },
      });
    }

    case "tokenStatus": {
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      const status = await getTokenStatus(channelId);
      const token = await getChannelToken(channelId);
      const channelMismatch = token?.googleChannelId && token.googleChannelId !== channelId;
      return Response.json({
        data: {
          channelId,
          status,
          channelTitle: token?.channelTitle || null,
          updatedAt: token?.updatedAt || null,
          kvConfigured: isKVConfigured(),
          channelMismatch: !!channelMismatch,
          googleChannelId: token?.googleChannelId || null,
        },
      });
    }

    case "bulkTokenStatus": {
      const channelIdsParam = url.searchParams.get("channelIds") || "";
      const channelIds = channelIdsParam.split(",").filter(Boolean);

      const statuses: Record<string, { status: string; channelTitle?: string; updatedAt?: string; channelMismatch?: boolean; googleChannelId?: string }> = {};
      for (const id of channelIds) {
        const status = await getTokenStatus(id);
        const token = await getChannelToken(id);
        statuses[id] = {
          status,
          channelTitle: token?.channelTitle || undefined,
          updatedAt: token?.updatedAt || undefined,
          channelMismatch: !!(token?.googleChannelId && token.googleChannelId !== id),
          googleChannelId: token?.googleChannelId || undefined,
        };
      }

      return Response.json({ data: { statuses, kvConfigured: isKVConfigured() } });
    }

    case "deleteToken": {
      // Allow any authenticated user to delete channel tokens
      // (clients delete their own channel tokens on channel remove/delink)
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      await deleteChannelToken(channelId);
      return Response.json({ data: { success: true, channelId } });
    }

    case "bulkExpireTokens": {
      if (!isAdminUser) {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
      const clientId = url.searchParams.get("clientId");
      const channelIdsParam = url.searchParams.get("channelIds") || "";
      const channelIds = channelIdsParam.split(",").filter(Boolean);

      if (!clientId || channelIds.length === 0) {
        return Response.json({ error: "clientId and channelIds required" }, { status: 400 });
      }

      const results: { channelId: string; success: boolean; error?: string }[] = [];
      for (const cid of channelIds) {
        try {
          await deleteChannelToken(cid);
          results.push({ channelId: cid, success: true });
        } catch (err) {
          results.push({ channelId: cid, success: false, error: err instanceof Error ? err.message : String(err) });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      console.log(`[bulkExpireTokens] Admin ${session.user.email} expired tokens for client ${clientId}: ${successCount}/${channelIds.length} channels`);

      // Sync to backend
      expireAllTokensOnBackend(clientId, session.user.email || "admin").catch((err) => {
        console.warn("[bulkExpireTokens] Backend sync error:", err);
      });

      return Response.json({
        data: {
          success: true,
          clientId,
          affectedChannels: channelIds,
          results,
          adminEmail: session.user.email,
          actionDate: new Date().toISOString(),
        },
      });
    }

    case "permanentRemoveChannel": {
      if (!isAdminUser) {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      // Delete token
      await deleteChannelToken(channelId);

      // Remove from all client data in KV
      try {
        const { removeChannelFromAllCaches } = await import("@/lib/client-data-cache");
        await removeChannelFromAllCaches(channelId);
      } catch (err) {
        console.warn("[permanentRemoveChannel] Cache cleanup error:", err);
      }

      // Remove from user's channel list in KV (shared bainsla_users array)
      try {
        const USERS_KEY = "bainsla_users";
        const users = await kv.get<Array<{ id: string; channels: string[]; pendingChannels?: string[] }>>(USERS_KEY) || [];
        let changed = false;
        for (const user of users) {
          if (user.channels?.includes(channelId)) {
            user.channels = user.channels.filter((c: string) => c !== channelId);
            changed = true;
          }
          if (user.pendingChannels?.includes(channelId)) {
            user.pendingChannels = user.pendingChannels.filter((c: string) => c !== channelId);
            changed = true;
          }
        }
        if (changed) {
          await kv.set(USERS_KEY, users);
        }
      } catch (err) {
        console.warn("[permanentRemoveChannel] User cleanup error:", err);
      }

      // Clear cached videos and stats for this channel
      try {
        await kv.del(`yt_videos:${channelId}`);
        await kv.del(`yt_channel_stats:${channelId}`);
        await kv.del(`yt_dashboard:${channelId}`);
      } catch { /* ignore */ }

      // Sync permanent removal to backend database
      permanentRemoveFromBackend(channelId, session.user.email || "admin").catch((err) => {
        console.warn("[permanentRemoveChannel] Backend sync error:", err);
      });

      console.log(`[permanentRemoveChannel] Admin ${session.user.email} permanently removed channel ${channelId}`);

      return Response.json({
        data: {
          success: true,
          channelId,
          adminEmail: session.user.email,
          actionDate: new Date().toISOString(),
        },
      });
    }

    default:
      return Response.json({ error: "Invalid action" }, { status: 400 });
  }
}

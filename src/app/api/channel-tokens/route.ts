import { randomBytes } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getChannelToken,
  deleteChannelToken,
  getTokenStatus,
  isKVConfigured,
} from "@/lib/channel-tokens";
import { kv } from "@/lib/redis";
import {
  permanentRemoveFromBackend,
  expireAllTokensOnBackend,
  removeChannelFromBackend,
} from "@/lib/backend-sync";
import { removeChannelFromAllCaches } from "@/lib/client-data-cache";
import { clearChannelVendorAssignments } from "@/lib/vendors";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

interface ChannelScopeUser {
  id: string;
  email: string;
  role: "client" | "company";
  parentId?: string;
  channels?: string[];
  pendingChannels?: string[];
  status?: "active" | "inactive" | "pending";
}

interface ChannelOAuthState {
  channelId: string;
  channelTitle: string;
  createdBy: string;
  createdAt: string;
}

async function getAllowedChannelIds(email: string): Promise<Set<string>> {
  const users = (await kv.get<ChannelScopeUser[]>("bainsla_users")) || [];
  const normalizedEmail = email.toLowerCase();
  const currentUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (!currentUser || currentUser.status === "inactive") return new Set();
  const scopedUsers = currentUser.role === "company"
    ? [currentUser, ...users.filter((user) => user.parentId === currentUser.id && user.status !== "inactive")]
    : [currentUser];
  return new Set(
    scopedUsers.flatMap((user) => [...(user.channels || []), ...(user.pendingChannels || [])])
  );
}

async function removeChannelAssignments(channelId: string): Promise<void> {
  const users = (await kv.get<ChannelScopeUser[]>("bainsla_users")) || [];
  let changed = false;
  for (const user of users) {
    const channels = (user.channels || []).filter((id) => id !== channelId);
    const pendingChannels = (user.pendingChannels || []).filter((id) => id !== channelId);
    if (
      channels.length !== (user.channels || []).length ||
      pendingChannels.length !== (user.pendingChannels || []).length
    ) {
      user.channels = channels;
      user.pendingChannels = pendingChannels;
      changed = true;
    }
  }
  if (changed) await kv.set("bainsla_users", users);
}

async function removeChannelFromCms(channelId: string): Promise<void> {
  const backendResult = await removeChannelFromBackend(channelId);
  if (!backendResult) throw new Error("Backend channel removal failed");

  await Promise.all([
    deleteChannelToken(channelId),
    removeChannelFromAllCaches(channelId),
    clearChannelVendorAssignments([channelId]),
  ]);
  await removeChannelAssignments(channelId);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.userStatus === "inactive") {
    return Response.json({ error: "Account is inactive" }, { status: 403 });
  }

  const isAdminUser = session.user.role === "admin" || isAdmin(session.user.email);
  const allowedChannelIds = isAdminUser
    ? null
    : await getAllowedChannelIds(session.user.email);

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "generateInviteLink": {
      const channelId = url.searchParams.get("channelId");
      const channelTitle = url.searchParams.get("channelTitle") || "";
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }
      if (!isAdminUser && !allowedChannelIds?.has(channelId)) {
        return Response.json({ error: "You can only validate assigned channels" }, { status: 403 });
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
      const nonce = randomBytes(32).toString("base64url");
      const state = `cms-oauth-${nonce}`;
      const oauthState: ChannelOAuthState = {
        channelId,
        channelTitle,
        createdBy: session.user.email,
        createdAt: new Date().toISOString(),
      };
      await kv.setex(`channel_oauth_state:${nonce}`, 15 * 60, oauthState);

      const scopes = [
        "https://www.googleapis.com/auth/youtube",
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
        `&state=${encodeURIComponent(state)}`;

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
      if (!isAdminUser && !allowedChannelIds?.has(channelId)) {
        return Response.json({ error: "You can only access tokens for assigned channels" }, { status: 403 });
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
      if (!isAdminUser && channelIds.some((channelId) => !allowedChannelIds?.has(channelId))) {
        return Response.json({ error: "You can only access tokens for assigned channels" }, { status: 403 });
      }

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

    case "removeChannel": {
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }
      if (!isAdminUser && !allowedChannelIds?.has(channelId)) {
        return Response.json({ error: "You can only remove assigned channels" }, { status: 403 });
      }

      try {
        await removeChannelFromCms(channelId);
        return Response.json({ data: { success: true, channelId } });
      } catch (error) {
        console.error(`[removeChannel] Failed for ${channelId}:`, error);
        return Response.json({ error: "Failed to remove channel completely" }, { status: 502 });
      }
    }

    case "deleteToken": {
      // Allow any authenticated user to delete channel tokens
      // (clients delete their own channel tokens on channel remove/delink)
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }
      if (!isAdminUser && !allowedChannelIds?.has(channelId)) {
        return Response.json({ error: "You can only remove tokens for assigned channels" }, { status: 403 });
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

      const backendResult = await permanentRemoveFromBackend(
        channelId,
        session.user.email || "admin"
      );
      if (!backendResult) {
        return Response.json({ error: "Backend channel removal failed" }, { status: 502 });
      }

      await Promise.all([
        deleteChannelToken(channelId),
        removeChannelFromAllCaches(channelId),
        clearChannelVendorAssignments([channelId]),
      ]);
      await removeChannelAssignments(channelId);

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

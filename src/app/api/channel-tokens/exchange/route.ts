import { setChannelToken, isKVConfigured, type ChannelToken, deleteChannelToken } from "@/lib/channel-tokens";
import { google } from "googleapis";
import { kv } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

interface ChannelScopeUser {
  id: string;
  email: string;
  role: "client" | "company";
  parentId?: string;
  channels?: string[];
  pendingChannels?: string[];
  status?: "active" | "inactive" | "pending";
}

export const dynamic = "force-dynamic";

interface ChannelOAuthState {
  channelId: string;
  channelTitle: string;
  createdBy: string;
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, state } = body as { code?: string; state?: string; redirectUri?: string };

    if (!code || !state) {
      return Response.json({ error: "Missing code or state" }, { status: 400 });
    }

    const users = (await kv.get<ChannelScopeUser[]>("bainsla_users")) || [];
    const inviteMatch = state.match(/^cms-oauth-([A-Za-z0-9_-]+)$/);
    let expectedChannelId: string;
    let oauthStateKey: string | null = null;

    if (inviteMatch) {
      oauthStateKey = `channel_oauth_state:${inviteMatch[1]}`;
      const oauthState = await kv.get<ChannelOAuthState>(oauthStateKey);
      if (!oauthState?.channelId) {
        return Response.json(
          { error: "This validation link has expired. Generate a new Validate Token link." },
          { status: 400 }
        );
      }
      expectedChannelId = oauthState.channelId;
      const isStillAssigned = users.some(
        (user) =>
          user.status !== "inactive" &&
          [...(user.channels || []), ...(user.pendingChannels || [])].includes(expectedChannelId)
      );
      if (!isStillAssigned) {
        return Response.json({ error: "This channel is no longer assigned" }, { status: 403 });
      }
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (session.user.userStatus === "inactive") {
        return Response.json({ error: "Account is inactive" }, { status: 403 });
      }

      const legacyMatch = state.match(/^youtube-auth-(.+)-\d+$/);
      if (legacyMatch) {
        expectedChannelId = legacyMatch[1];
      } else if (state.startsWith("UC")) {
        expectedChannelId = state;
      } else {
        return Response.json({ error: "Invalid state parameter" }, { status: 400 });
      }

      const normalizedEmail = session.user.email.toLowerCase();
      const isAdminUser = session.user.role === "admin" || ADMIN_EMAILS.includes(normalizedEmail);
      if (!isAdminUser) {
        const currentUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);
        const scopedUsers = currentUser?.status === "inactive"
          ? []
          : currentUser?.role === "company"
          ? [currentUser, ...users.filter((user) => user.parentId === currentUser.id && user.status !== "inactive")]
          : currentUser
            ? [currentUser]
            : [];
        const assignedChannels = new Set(
          scopedUsers.flatMap((user) => [...(user.channels || []), ...(user.pendingChannels || [])])
        );

        if (!assignedChannels.has(expectedChannelId)) {
          return Response.json(
            { error: "You can only validate channels assigned to your account" },
            { status: 403 }
          );
        }
      }
    }

    // Use NEXT_PUBLIC_GOOGLE_CLIENT_ID (same as invite link) for token exchange
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Prefer client-provided redirectUri (exact match with what was used in OAuth request)
    // Fall back to computing from request headers
    let redirectUri = body.redirectUri;
    if (!redirectUri) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
      const requestUrl = new URL(request.url);
      const host = forwardedHost || requestUrl.host;
      const protocol = forwardedHost ? forwardedProto : requestUrl.protocol.replace(":", "");
      redirectUri = `${protocol}://${host}/callback`;
    }

    if (!clientId || !clientSecret) {
      return Response.json({ error: "Google OAuth not configured" }, { status: 500 });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json();
      console.error("Token exchange error:", errData);
      return Response.json(
        { error: errData.error_description || "Failed to exchange authorization code" },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const grantedScopes = tokenData.scope || "";

    console.log(`[Token Exchange] Granted scopes for ${expectedChannelId}: ${grantedScopes}`);

    if (!accessToken) {
      return Response.json({ error: "No access token received" }, { status: 400 });
    }

    // Try to get channel info (may fail if quota exceeded — that's OK, token still gets saved)
    let googleChannelId = expectedChannelId;
    let channelTitle = expectedChannelId;
    let subscribers = 0;
    let totalViews = 0;
    let totalVideos = 0;
    let thumbnail = "";
    let quotaWarning = false;

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      const youtube = google.youtube({ version: "v3", auth: oauth2Client });
      const channelResponse = await youtube.channels.list({
        part: ["snippet", "statistics"],
        mine: true,
      });
      const channel = channelResponse.data.items?.[0];
      googleChannelId = channel?.id || expectedChannelId;
      channelTitle = channel?.snippet?.title || expectedChannelId;
      subscribers = Number(channel?.statistics?.subscriberCount || 0);
      totalViews = Number(channel?.statistics?.viewCount || 0);
      totalVideos = Number(channel?.statistics?.videoCount || 0);
      thumbnail = channel?.snippet?.thumbnails?.default?.url || "";
    } catch (ytError) {
      console.warn("YouTube API call failed (quota?), saving token anyway:", ytError);
      quotaWarning = true;
    }

    // Store the token with the expectedChannelId from state parameter
    const storageChannelId = expectedChannelId;

    // Check channel mismatch — if Google channel differs from expected, the user
    // logged in with the wrong account. Token won't have delete/edit permission for the expected channel.
    const channelMismatch = googleChannelId !== expectedChannelId && googleChannelId !== storageChannelId;

    if (channelMismatch && !quotaWarning) {
      console.warn(`[Token Exchange] CHANNEL MISMATCH! Expected: ${expectedChannelId}, Got: ${googleChannelId} ("${channelTitle}")`);
      return Response.json(
        {
          error: `This Google account owns "${channelTitle}" (${googleChannelId}), not the assigned channel (${expectedChannelId}).`,
        },
        { status: 400 }
      );
    }

    // Clear old token and cached data only after ownership validation succeeds.
    try {
      await deleteChannelToken(expectedChannelId);
      await kv.del(`yt_cache:videos:${expectedChannelId}`);
      await kv.del(`yt_cache:stats:${expectedChannelId}`);
      console.log(`[Token Exchange] Cleared old token and cache for ${expectedChannelId}`);
    } catch (error) {
      console.warn("[Token Exchange] Cache clear error (non-fatal):", error);
    }

    const channelToken: ChannelToken = {
      channelId: storageChannelId,
      channelTitle: channelMismatch ? channelTitle : channelTitle,
      accessToken,
      refreshToken: refreshToken || "",
      tokenExpiry: Date.now() + (tokenData.expires_in || 3600) * 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleChannelId,
      grantedScopes: grantedScopes,
    };

    // Log whether youtube write scope was granted (space-separated scopes from Google)
    const scopeList = grantedScopes.split(" ");
    const hasFullYouTube = scopeList.some((s: string) => s.endsWith("/auth/youtube"));
    console.log(`[Token Exchange] Has YouTube write scope: ${hasFullYouTube}, scopes: ${grantedScopes}`);

    await setChannelToken(storageChannelId, channelToken);
    if (oauthStateKey) await kv.del(oauthStateKey);

    console.log(`Token stored for channel: ${storageChannelId} (Google: ${googleChannelId}), KV: ${isKVConfigured()}`);

    return Response.json({
      data: {
        success: true,
        kvConfigured: isKVConfigured(),
        quotaWarning,
        channelMismatch,
        channelMismatchDetails: channelMismatch ? {
          expectedChannelId,
          actualGoogleChannelId: googleChannelId,
          actualChannelTitle: channelTitle,
          message: `Token validated but this Google account owns channel "${channelTitle}" (${googleChannelId}), not the channel you added (${expectedChannelId}). Video delete/edit will NOT work. Please login with the Google account that owns this channel.`,
        } : undefined,
        channelInfo: {
          channelId: storageChannelId,
          channelTitle,
          subscribers,
          totalViews,
          totalVideos,
          thumbnail,
        },
      },
    });
  } catch (error) {
    console.error("Exchange error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: `Failed to process authorization callback: ${errMsg}` },
      { status: 500 }
    );
  }
}

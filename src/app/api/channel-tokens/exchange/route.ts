import { setChannelToken, isKVConfigured, type ChannelToken, deleteChannelToken } from "@/lib/channel-tokens";
import { google } from "googleapis";
import { kv } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code || !state) {
      return Response.json({ error: "Missing code or state" }, { status: 400 });
    }

    // State is the channel ID directly (e.g. UCJL86UBFftNd1BoHAvxgT7Q)
    // Also support legacy format: youtube-auth-CHANNELID-TIMESTAMP
    let expectedChannelId: string;
    const legacyMatch = state.match(/^youtube-auth-(.+)-\d+$/);
    if (legacyMatch) {
      expectedChannelId = legacyMatch[1];
    } else if (state.startsWith("UC")) {
      expectedChannelId = state;
    } else {
      return Response.json({ error: "Invalid state parameter" }, { status: 400 });
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

    // Clear old token and cached data for fresh start on re-validation
    try {
      await deleteChannelToken(expectedChannelId);
      // Clear cached videos and stats for this channel (fresh start)
      await kv.del(`yt_cache:videos:${expectedChannelId}`);
      await kv.del(`yt_cache:stats:${expectedChannelId}`);
      console.log(`[Token Exchange] Cleared old token and cache for ${expectedChannelId}`);
    } catch (e) {
      console.warn("[Token Exchange] Cache clear error (non-fatal):", e);
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
      // Still store the token (for read operations like analytics) but flag the mismatch
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

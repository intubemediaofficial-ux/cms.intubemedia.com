import { setChannelToken, isKVConfigured, type ChannelToken } from "@/lib/channel-tokens";
import { google } from "googleapis";

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
    // Use x-forwarded-host/host header to get the correct public URL on Vercel
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const requestUrl = new URL(request.url);
    const host = forwardedHost || requestUrl.host;
    const protocol = forwardedHost ? forwardedProto : requestUrl.protocol.replace(":", "");
    const redirectUri = `${protocol}://${host}/callback`;

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

    if (!accessToken) {
      return Response.json({ error: "No access token received" }, { status: 400 });
    }

    // Use the access token to get channel info
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ["snippet", "statistics"],
      mine: true,
    });

    const channel = channelResponse.data.items?.[0];
    const googleChannelId = channel?.id || "unknown";
    const channelTitle = channel?.snippet?.title || "Unknown Channel";
    const subscribers = Number(channel?.statistics?.subscriberCount || 0);
    const totalViews = Number(channel?.statistics?.viewCount || 0);
    const totalVideos = Number(channel?.statistics?.videoCount || 0);
    const thumbnail = channel?.snippet?.thumbnails?.default?.url || "";

    // Store the token with the expectedChannelId from state parameter
    // This ensures the token is stored with the same ID that the CMS uses
    const storageChannelId = expectedChannelId;

    const channelToken: ChannelToken = {
      channelId: storageChannelId,
      channelTitle,
      accessToken,
      refreshToken: refreshToken || "",
      tokenExpiry: Date.now() + (tokenData.expires_in || 3600) * 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleChannelId,
    };

    await setChannelToken(storageChannelId, channelToken);

    console.log(`Token stored for channel: ${storageChannelId} (Google: ${googleChannelId}), KV: ${isKVConfigured()}`);

    return Response.json({
      data: {
        success: true,
        kvConfigured: isKVConfigured(),
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
    return Response.json(
      { error: "Failed to process authorization callback" },
      { status: 500 }
    );
  }
}

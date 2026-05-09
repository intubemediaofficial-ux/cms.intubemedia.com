import { kv } from "@vercel/kv";

export interface ChannelToken {
  channelId: string;
  channelTitle?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry?: number;
  createdAt: string;
  updatedAt: string;
}

const TOKEN_PREFIX = "channel_token:";
const KV_AVAILABLE = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory fallback when Vercel KV is not configured
const memoryStore = new Map<string, ChannelToken>();

export async function getChannelToken(channelId: string): Promise<ChannelToken | null> {
  if (KV_AVAILABLE) {
    try {
      return await kv.get<ChannelToken>(`${TOKEN_PREFIX}${channelId}`);
    } catch {
      return memoryStore.get(channelId) || null;
    }
  }
  return memoryStore.get(channelId) || null;
}

export async function setChannelToken(channelId: string, token: ChannelToken): Promise<void> {
  if (KV_AVAILABLE) {
    try {
      await kv.set(`${TOKEN_PREFIX}${channelId}`, token);
    } catch {
      memoryStore.set(channelId, token);
    }
  } else {
    memoryStore.set(channelId, token);
  }
}

export async function deleteChannelToken(channelId: string): Promise<void> {
  if (KV_AVAILABLE) {
    try {
      await kv.del(`${TOKEN_PREFIX}${channelId}`);
    } catch {
      memoryStore.delete(channelId);
    }
  } else {
    memoryStore.delete(channelId);
  }
}

export async function getTokenStatus(channelId: string): Promise<"valid" | "expired" | "none"> {
  const token = await getChannelToken(channelId);
  if (!token) return "none";

  if (token.tokenExpiry && Date.now() > token.tokenExpiry) {
    // Try to refresh
    return "expired";
  }
  return "valid";
}

export async function refreshChannelToken(channelId: string): Promise<ChannelToken | null> {
  const token = await getChannelToken(channelId);
  if (!token?.refreshToken) return null;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const updatedToken: ChannelToken = {
      ...token,
      accessToken: data.access_token,
      tokenExpiry: Date.now() + (data.expires_in || 3600) * 1000,
      updatedAt: new Date().toISOString(),
    };

    await setChannelToken(channelId, updatedToken);
    return updatedToken;
  } catch {
    return null;
  }
}

export async function getValidAccessToken(channelId: string): Promise<string | null> {
  let token = await getChannelToken(channelId);
  if (!token) return null;

  // If token is expired, try to refresh
  if (token.tokenExpiry && Date.now() > token.tokenExpiry) {
    token = await refreshChannelToken(channelId);
    if (!token) return null;
  }

  return token.accessToken;
}

export function isKVConfigured(): boolean {
  return KV_AVAILABLE;
}

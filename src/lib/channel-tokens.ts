import { kv } from "@/lib/redis";

export interface ChannelToken {
  channelId: string;
  channelTitle?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry?: number;
  createdAt: string;
  updatedAt: string;
  googleChannelId?: string;
  grantedScopes?: string;
}

const TOKEN_PREFIX = "channel_token:";

function isKVAvailable(): boolean {
  return true; // Always available — using DigitalOcean Redis
}

// In-memory fallback when Vercel KV is not configured
const memoryStore = new Map<string, ChannelToken>();

export async function getChannelToken(channelId: string): Promise<ChannelToken | null> {
  if (isKVAvailable()) {
    try {
      const token = await kv.get<ChannelToken>(`${TOKEN_PREFIX}${channelId}`);
      return token;
    } catch (error) {
      console.error(`[KV] Failed to get token for ${channelId}:`, error);
      return memoryStore.get(channelId) || null;
    }
  }
  console.warn(`[KV] Not configured — using in-memory store for ${channelId}`);
  return memoryStore.get(channelId) || null;
}

export async function setChannelToken(channelId: string, token: ChannelToken): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.set(`${TOKEN_PREFIX}${channelId}`, token);
      console.log(`[KV] Token stored successfully for ${channelId}`);
      return;
    } catch (error) {
      console.error(`[KV] Failed to store token for ${channelId}:`, error);
      // Fall through to memory store
    }
  } else {
    console.warn(`[KV] Not configured — storing token in-memory for ${channelId} (will not persist across deployments)`);
  }
  memoryStore.set(channelId, token);
}

export async function deleteChannelToken(channelId: string): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.del(`${TOKEN_PREFIX}${channelId}`);
      console.log(`[KV] Token deleted for ${channelId}`);
      return;
    } catch (error) {
      console.error(`[KV] Failed to delete token for ${channelId}:`, error);
    }
  }
  memoryStore.delete(channelId);
}

export async function getTokenStatus(channelId: string): Promise<"valid" | "expired" | "none"> {
  const token = await getChannelToken(channelId);
  if (!token) return "none";

  if (token.tokenExpiry && Date.now() > token.tokenExpiry) {
    // Token expired — try to refresh using refresh_token
    if (token.refreshToken) {
      const refreshed = await refreshChannelToken(channelId);
      if (refreshed) return "valid";
    }
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
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!,
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

export async function getAnyValidAccessToken(channelIds: string[]): Promise<string | null> {
  for (const cid of channelIds) {
    const t = await getValidAccessToken(cid);
    if (t) return t;
  }
  return null;
}

export function isKVConfigured(): boolean {
  return isKVAvailable();
}

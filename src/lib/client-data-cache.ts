import { kv } from "@vercel/kv";

export interface CachedChannelData {
  channelId: string;
  channelTitle: string;
  thumbnail: string;
  subscribers: number;
  views: number;
  videoCount: number;
  estimatedRevenue: number;
  rpm: number;
  cpm: number;
  lastUpdated: string;
}

export interface CachedClientData {
  userId: string;
  email: string;
  channels: CachedChannelData[];
  totalRevenue: number;
  totalViews: number;
  totalSubscribers: number;
  lastUpdated: string;
}

const CACHE_PREFIX = "client_data_cache:";

function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function cacheClientData(userId: string, data: CachedClientData): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    await kv.set(`${CACHE_PREFIX}${userId}`, data);
  } catch (error) {
    console.error(`[Cache] Failed to cache data for ${userId}:`, error);
  }
}

export async function getCachedClientData(userId: string): Promise<CachedClientData | null> {
  if (!isKVAvailable()) return null;
  try {
    return await kv.get<CachedClientData>(`${CACHE_PREFIX}${userId}`);
  } catch (error) {
    console.error(`[Cache] Failed to get cached data for ${userId}:`, error);
    return null;
  }
}

export async function getAllCachedClientData(): Promise<CachedClientData[]> {
  if (!isKVAvailable()) return [];
  try {
    const keys = await kv.keys(`${CACHE_PREFIX}*`);
    if (keys.length === 0) return [];
    const results: CachedClientData[] = [];
    for (const key of keys) {
      const data = await kv.get<CachedClientData>(key);
      if (data) results.push(data);
    }
    return results;
  } catch (error) {
    console.error("[Cache] Failed to get all cached data:", error);
    return [];
  }
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
  panNumber: string;
}

const BANK_PREFIX = "bank_details:";

export async function saveBankDetails(userId: string, details: BankDetails): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    await kv.set(`${BANK_PREFIX}${userId}`, details);
  } catch (error) {
    console.error(`[Bank] Failed to save bank details for ${userId}:`, error);
  }
}

export async function getBankDetails(userId: string): Promise<BankDetails | null> {
  if (!isKVAvailable()) return null;
  try {
    return await kv.get<BankDetails>(`${BANK_PREFIX}${userId}`);
  } catch (error) {
    console.error(`[Bank] Failed to get bank details for ${userId}:`, error);
    return null;
  }
}

export interface Agreement {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  notes: string;
}

const AGREEMENT_PREFIX = "agreements:";

export async function saveAgreements(userId: string, agreements: Agreement[]): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    await kv.set(`${AGREEMENT_PREFIX}${userId}`, agreements);
  } catch (error) {
    console.error(`[Agreement] Failed to save agreements for ${userId}:`, error);
  }
}

export async function getAgreements(userId: string): Promise<Agreement[]> {
  if (!isKVAvailable()) return [];
  try {
    return await kv.get<Agreement[]>(`${AGREEMENT_PREFIX}${userId}`) || [];
  } catch (error) {
    console.error(`[Agreement] Failed to get agreements for ${userId}:`, error);
    return [];
  }
}

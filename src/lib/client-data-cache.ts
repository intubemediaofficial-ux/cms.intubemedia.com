import { kv } from "@/lib/redis";

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
  return true; // Always available — using DigitalOcean Redis
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

export async function removeChannelFromAllCaches(channelId: string): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    const keys = await kv.keys(`${CACHE_PREFIX}*`);
    for (const key of keys) {
      const data = await kv.get<CachedClientData>(key);
      if (data && data.channels?.some((ch) => ch.channelId === channelId)) {
        data.channels = data.channels.filter((ch) => ch.channelId !== channelId);
        await kv.set(key, data);
      }
    }
  } catch (error) {
    console.error(`[Cache] Failed to remove channel ${channelId} from caches:`, error);
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

// Warning/Notification System
export interface AdminWarning {
  id: string;
  message: string;
  type: "maintenance" | "warning" | "info";
  createdAt: string;
  createdBy: string;
}

const GLOBAL_WARNING_KEY = "admin_global_warning";
const CLIENT_WARNING_PREFIX = "client_warning:";

export async function setGlobalWarning(warning: AdminWarning | null): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    if (warning) {
      await kv.set(GLOBAL_WARNING_KEY, warning);
    } else {
      await kv.del(GLOBAL_WARNING_KEY);
    }
  } catch (error) {
    console.error("[Warning] Failed to set global warning:", error);
  }
}

export async function getGlobalWarning(): Promise<AdminWarning | null> {
  if (!isKVAvailable()) return null;
  try {
    return await kv.get<AdminWarning>(GLOBAL_WARNING_KEY);
  } catch (error) {
    console.error("[Warning] Failed to get global warning:", error);
    return null;
  }
}

export async function setClientWarning(userId: string, warning: AdminWarning | null): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    if (warning) {
      await kv.set(`${CLIENT_WARNING_PREFIX}${userId}`, warning);
    } else {
      await kv.del(`${CLIENT_WARNING_PREFIX}${userId}`);
    }
  } catch (error) {
    console.error(`[Warning] Failed to set client warning for ${userId}:`, error);
  }
}

export async function getClientWarning(userId: string): Promise<AdminWarning | null> {
  if (!isKVAvailable()) return null;
  try {
    return await kv.get<AdminWarning>(`${CLIENT_WARNING_PREFIX}${userId}`);
  } catch (error) {
    console.error(`[Warning] Failed to get client warning for ${userId}:`, error);
    return null;
  }
}

// Support Request System
export interface SupportRequest {
  id: string;
  clientEmail: string;
  clientName: string;
  message: string;
  screenshot?: string;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  adminResponse?: string;
}

const SUPPORT_REQUESTS_KEY = "support_requests";

export async function getSupportRequests(): Promise<SupportRequest[]> {
  if (!isKVAvailable()) return [];
  try {
    return await kv.get<SupportRequest[]>(SUPPORT_REQUESTS_KEY) || [];
  } catch (error) {
    console.error("[Support] Failed to get support requests:", error);
    return [];
  }
}

export async function addSupportRequest(request: SupportRequest): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    const existing = await getSupportRequests();
    existing.unshift(request);
    // Keep last 100 requests
    await kv.set(SUPPORT_REQUESTS_KEY, existing.slice(0, 100));
  } catch (error) {
    console.error("[Support] Failed to add support request:", error);
  }
}

export async function resolveSupportRequest(requestId: string, adminResponse?: string): Promise<void> {
  if (!isKVAvailable()) return;
  try {
    const existing = await getSupportRequests();
    const updated = existing.map((r) =>
      r.id === requestId
        ? { ...r, status: "resolved" as const, resolvedAt: new Date().toISOString(), adminResponse: adminResponse || "" }
        : r
    );
    await kv.set(SUPPORT_REQUESTS_KEY, updated);
  } catch (error) {
    console.error("[Support] Failed to resolve support request:", error);
  }
}

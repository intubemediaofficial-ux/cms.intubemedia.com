"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Radio,
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown,
  Shield,
  UserPlus,
  Activity,
  Search,
  Filter,
  Loader2,
  Crown,
  BarChart3,
  Video,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";
import DateRangeFilter, { computeRange } from "@/components/dashboard/DateRangeFilter";
import type { DateRange } from "@/components/dashboard/DateRangeFilter";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  channels: string[];
  status: "active" | "inactive";
  joinedDate: string;
  category: string;
}

interface ChannelInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  customUrl: string;
  clientName: string;
  clientEmail: string;
}

interface AnalyticsResponse {
  columnHeaders?: Array<{ name?: string | null }>;
  rows?: Array<Array<string | number>>;
}

interface ChannelItem {
  id?: string | null;
  snippet?: {
    title?: string | null;
    thumbnails?: { default?: { url?: string | null } | null } | null;
  };
  statistics?: {
    viewCount?: string | null;
    subscriberCount?: string | null;
    videoCount?: string | null;
  };
}

interface PerChannelAnalytics {
  performance: AnalyticsResponse | null;
  prevPerformance: AnalyticsResponse | null;
  revenue: AnalyticsResponse | null;
  prevRevenue: AnalyticsResponse | null;
  dailyRevenue: AnalyticsResponse | null;
  revenueViews: AnalyticsResponse | null;
}

interface DashboardFullData {
  channels?: ChannelItem[];
  currentRevenue?: AnalyticsResponse | null;
  prevRevenue?: AnalyticsResponse | null;
  currentPerformance?: AnalyticsResponse | null;
  prevPerformance?: AnalyticsResponse | null;
  dailyRevenue?: AnalyticsResponse | null;
  perChannelAnalytics?: Record<string, PerChannelAnalytics>;
  tokenizedChannels?: string[];
  _debug?: {
    totalChannelIds: number;
    tokenizedCount: number;
    channelTokenErrors: Record<string, string>;
    perChannelErrors: Record<string, string>;
    hasAdminToken: boolean;
  };
}

function sumMetric(data: AnalyticsResponse | undefined | null, metricName: string): number {
  if (!data?.rows?.length || !data.columnHeaders) return 0;
  const headers = data.columnHeaders.map((h) => h.name || "");
  const idx = headers.indexOf(metricName);
  if (idx === -1) return 0;
  return data.rows.reduce((sum, row) => sum + (Number(row[idx]) || 0), 0);
}

function getDailyRevenueChartData(data: AnalyticsResponse | null | undefined) {
  if (!data?.rows?.length || !data.columnHeaders) return [];
  const headers = data.columnHeaders.map((h) => h.name || "");
  const dayIdx = headers.indexOf("day");
  const revIdx = headers.indexOf("estimatedRevenue");
  if (dayIdx === -1 || revIdx === -1) return [];
  return data.rows.map((row) => ({
    date: String(row[dayIdx]).slice(5),
    fullDate: String(row[dayIdx]),
    revenue: Math.round((Number(row[revIdx]) || 0) * 100) / 100,
  }));
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"channels" | "name" | "status">("channels");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState("28d");
  const [dateRange, setDateRange] = useState<DateRange>(() => computeRange("28d"));
  const [tokenStatuses, setTokenStatuses] = useState<Record<string, { status: string; channelTitle?: string; updatedAt?: string }>>({});
  const [dailyRevDays, setDailyRevDays] = useState<1 | 3 | 7 | 30 | "all">(7);

  // Cached client data from KV (auto-saved when clients load their dashboards)
  interface CachedChannelData {
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
  interface CachedClientData {
    userId: string;
    email: string;
    channels: CachedChannelData[];
    totalRevenue: number;
    totalViews: number;
    totalSubscribers: number;
    lastUpdated: string;
  }
  const [cachedClientData, setCachedClientData] = useState<CachedClientData[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        setClients(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cached data first, then trigger server-side sync in background
  const fetchCachedData = useCallback(async () => {
    try {
      // 1. Load existing cached data immediately
      const res = await fetch("/api/client-data?action=getAllCachedData");
      if (res.ok) {
        const json = await res.json();
        setCachedClientData(json.data || []);
      }
      // 2. Trigger background sync — fetches fresh YouTube data for all clients
      setSyncing(true);
      try {
        await fetch("/api/sync-client-data");
        // 3. Reload cached data after sync completes
        const res2 = await fetch("/api/client-data?action=getAllCachedData");
        if (res2.ok) {
          const json2 = await res2.json();
          if (json2.data?.length) setCachedClientData(json2.data);
        }
      } catch { /* silent */ }
      finally { setSyncing(false); }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchClients();
      fetchCachedData();
    }
  }, [status, session, fetchClients, fetchCachedData]);

  // Collect all channel IDs from clients + cached data (to handle test IDs in KV)
  const allChannelIds = useMemo(() => {
    const kvIds = clients.reduce<string[]>((acc, c) => [...acc, ...c.channels], []);
    const cachedIds = cachedClientData.flatMap((cd) => cd.channels.map((ch) => ch.channelId));
    const allSet = new Set([...kvIds, ...cachedIds]);
    // Prefer real IDs over test IDs
    const realIds = Array.from(allSet).filter((id) => !id.startsWith("UCtest") && id !== "test");
    return realIds.length > 0 ? realIds : Array.from(allSet);
  }, [clients, cachedClientData]);

  // Fetch token statuses for all channels
  useEffect(() => {
    if (allChannelIds.length === 0) return;
    const fetchTokenStatuses = async () => {
      try {
        const res = await fetch(`/api/channel-tokens?action=bulkTokenStatus&channelIds=${allChannelIds.join(",")}`);
        if (res.ok) {
          const json = await res.json();
          setTokenStatuses(json.data?.statuses || {});
        }
      } catch { /* silent */ }
    };
    fetchTokenStatuses();
  }, [allChannelIds]);

  const ytApiParams = useMemo(() => ({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    prevStartDate: dateRange.prevStartDate,
    prevEndDate: dateRange.prevEndDate,
    ...(allChannelIds.length > 0 ? { channelIds: allChannelIds.join(",") } : {}),
  }), [dateRange, allChannelIds]);

  const { data: dashData, loading: ytLoading, cached: dashCached, lastUpdated: dashLastUpdated } = useYouTubeData<DashboardFullData>(
    "dashboardFull",
    ytApiParams,
    {}
  );

  // Aggregate cached client data totals
  const cachedTotals = useMemo(() => {
    let totalRevenue = 0;
    let totalViews = 0;
    let totalSubscribers = 0;
    for (const cd of cachedClientData) {
      totalRevenue += cd.totalRevenue || 0;
      totalViews += cd.totalViews || 0;
      totalSubscribers += cd.totalSubscribers || 0;
    }
    return { totalRevenue, totalViews, totalSubscribers };
  }, [cachedClientData]);

  // Build cached channel map for quick lookup
  const cachedChannelMap = useMemo(() => {
    const map: Record<string, CachedChannelData> = {};
    for (const cd of cachedClientData) {
      for (const ch of cd.channels) {
        map[ch.channelId] = ch;
      }
    }
    return map;
  }, [cachedClientData]);

  // Aggregate YouTube analytics data (with cached data fallback)
  const ytStats = useMemo(() => {
    const perChannelAnalytics = dashData?.perChannelAnalytics || {};
    const perChannelEntries = Object.values(perChannelAnalytics);

    let curEstRevenue = sumMetric(dashData?.currentRevenue, "estimatedRevenue");
    let curAdRevenue = sumMetric(dashData?.currentRevenue, "estimatedAdRevenue");
    let curGrossRevenue = sumMetric(dashData?.currentRevenue, "grossRevenue");
    let prevEstRevenue = sumMetric(dashData?.prevRevenue, "estimatedRevenue");

    let curViews = sumMetric(dashData?.currentPerformance, "views");
    let prevViews = sumMetric(dashData?.prevPerformance, "views");
    let curSubs = sumMetric(dashData?.currentPerformance, "subscribersGained") - sumMetric(dashData?.currentPerformance, "subscribersLost");
    let prevSubs = sumMetric(dashData?.prevPerformance, "subscribersGained") - sumMetric(dashData?.prevPerformance, "subscribersLost");

    for (const pca of perChannelEntries) {
      curEstRevenue += sumMetric(pca.revenue, "estimatedRevenue");
      curAdRevenue += sumMetric(pca.revenue, "estimatedAdRevenue");
      curGrossRevenue += sumMetric(pca.revenue, "grossRevenue");
      prevEstRevenue += sumMetric(pca.prevRevenue, "estimatedRevenue");
      curViews += sumMetric(pca.performance, "views");
      prevViews += sumMetric(pca.prevPerformance, "views");
      curSubs += sumMetric(pca.performance, "subscribersGained") - sumMetric(pca.performance, "subscribersLost");
      prevSubs += sumMetric(pca.prevPerformance, "subscribersGained") - sumMetric(pca.prevPerformance, "subscribersLost");
    }

    // Use cached data as fallback when YouTube API returns 0
    const useCachedRevenue = curEstRevenue === 0 && cachedTotals.totalRevenue > 0;
    if (useCachedRevenue) curEstRevenue = cachedTotals.totalRevenue;

    const curCPM = curViews > 0 ? (curEstRevenue / curViews) * 1000 : 0;
    const prevCPM = prevViews > 0 ? (prevEstRevenue / prevViews) * 1000 : 0;
    const curRPM = curViews > 0 ? (curEstRevenue / curViews) * 1000 : 0;
    const prevRPM = prevViews > 0 ? (prevEstRevenue / prevViews) * 1000 : 0;

    let totalSubscribers = (dashData?.channels || []).reduce((sum, ch) => sum + Number(ch?.statistics?.subscriberCount || 0), 0);
    let totalViewsAll = (dashData?.channels || []).reduce((sum, ch) => sum + Number(ch?.statistics?.viewCount || 0), 0);

    // Use cached totals as fallback
    if (totalSubscribers === 0 && cachedTotals.totalSubscribers > 0) totalSubscribers = cachedTotals.totalSubscribers;
    if (totalViewsAll === 0 && cachedTotals.totalViews > 0) totalViewsAll = cachedTotals.totalViews;

    return {
      curEstRevenue, prevEstRevenue,
      curViews, prevViews,
      curSubs, prevSubs,
      curCPM, prevCPM,
      curRPM, prevRPM,
      totalSubscribers, totalViewsAll,
      usedCachedData: useCachedRevenue || (totalSubscribers > 0 && cachedTotals.totalSubscribers > 0),
    };
  }, [dashData, cachedTotals]);

  // Per-Channel Daily Revenue table data
  const perChannelDailyRevenue = useMemo(() => {
    const perChannel = dashData?.perChannelAnalytics || {};
    const channelList = dashData?.channels || [];
    const channelNameMap: Record<string, string> = {};
    for (const ch of channelList) {
      if (ch.id) channelNameMap[ch.id] = ch.snippet?.title || ch.id;
    }

    const result: { channelId: string; channelName: string; clientName: string; dailyMap: Record<string, number>; monthTotal: number }[] = [];
    const allDates = new Set<string>();
    const dateToFullDate = new Map<string, string>();

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    for (const [cid, pca] of Object.entries(perChannel)) {
      const daily = getDailyRevenueChartData(pca.dailyRevenue);
      const dailyMap: Record<string, number> = {};
      let monthTotal = 0;
      for (const d of daily) {
        dailyMap[d.date] = d.revenue;
        allDates.add(d.date);
        if (d.fullDate) dateToFullDate.set(d.date, d.fullDate);
        if (d.fullDate && d.fullDate.startsWith(currentMonthPrefix)) {
          monthTotal += d.revenue;
        }
      }
      const client = clients.find((c) => c.channels.includes(cid));
      result.push({
        channelId: cid,
        channelName: channelNameMap[cid] || cid,
        clientName: client?.name || "-",
        dailyMap,
        monthTotal,
      });
    }

    const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));
    let filteredDates: string[];
    if (dailyRevDays === 30) {
      filteredDates = sortedDates.filter((d) => {
        const fd = dateToFullDate.get(d);
        return fd ? fd.startsWith(currentMonthPrefix) : false;
      });
    } else if (dailyRevDays === "all") {
      filteredDates = sortedDates;
    } else {
      filteredDates = sortedDates.slice(0, dailyRevDays);
    }

    const currentMonthName = now.toLocaleString("en-US", { month: "short", year: "numeric" });

    return { channels: result, dates: filteredDates, currentMonthName };
  }, [dashData, dailyRevDays, clients]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === "active").length;
    const inactiveClients = clients.filter((c) => c.status === "inactive").length;
    const totalChannels = clients.reduce((sum, c) => sum + c.channels.length, 0);
    const avgChannelsPerClient = totalClients > 0 ? totalChannels / totalClients : 0;
    const clientsWithChannels = clients.filter((c) => c.channels.length > 0).length;
    const clientsWithoutChannels = clients.filter((c) => c.channels.length === 0).length;
    const categories = clients.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalClients,
      activeClients,
      inactiveClients,
      totalChannels,
      avgChannelsPerClient,
      clientsWithChannels,
      clientsWithoutChannels,
      categories,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    let result = clients;

    if (clientFilter === "active") {
      result = result.filter((c) => c.status === "active");
    } else if (clientFilter === "inactive") {
      result = result.filter((c) => c.status === "inactive");
    } else if (clientFilter === "with-channels") {
      result = result.filter((c) => c.channels.length > 0);
    } else if (clientFilter === "without-channels") {
      result = result.filter((c) => c.channels.length === 0);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.channels.some((ch) => ch.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "channels") cmp = a.channels.length - b.channels.length;
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [clients, clientFilter, searchQuery, sortBy, sortDir]);

  const topClientsByChannels = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.channels.length - a.channels.length)
      .slice(0, 5);
  }, [clients]);

  const categoryBreakdown = useMemo(() => {
    return Object.entries(stats.categories)
      .sort(([, a], [, b]) => b - a);
  }, [stats.categories]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin Panel</span>
        <span>›</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of all clients, channels, and system metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setSyncing(true);
              try {
                await fetch("/api/sync-client-data");
                const res = await fetch("/api/client-data?action=getAllCachedData");
                if (res.ok) {
                  const json = await res.json();
                  if (json.data?.length) setCachedClientData(json.data);
                }
              } catch { /* silent */ }
              finally { setSyncing(false); }
            }}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync YouTube Data"}
          </button>
          <button
            onClick={fetchClients}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {dashCached && dashLastUpdated && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Showing cached data — Last updated: {new Date(dashLastUpdated).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</span>
        </div>
      )}

      {/* Syncing indicator */}
      {syncing && cachedClientData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />
          <p className="text-sm text-yellow-700">
            <strong>Syncing YouTube data for all clients...</strong> This may take a minute on first load.
          </p>
        </div>
      )}

      {/* Cached Data Info */}
      {cachedClientData.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm text-blue-700">
            Cached data from <strong>{cachedClientData.length}</strong> client(s) — 
            Last synced: {(() => {
              const latest = cachedClientData.reduce((a, b) => 
                new Date(a.lastUpdated) > new Date(b.lastUpdated) ? a : b
              );
              return new Date(latest.lastUpdated).toLocaleString("en-IN");
            })()}
          </p>
          <p className="text-xs text-blue-500">
            Revenue: ${cachedClientData.reduce((s, c) => s + (c.totalRevenue || 0), 0).toFixed(2)} | 
            Subs: {cachedClientData.reduce((s, c) => s + (c.totalSubscribers || 0), 0).toLocaleString()}
          </p>
        </div>
      )}

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Avg Channels/User</p>
              <p className="text-2xl font-bold text-foreground">{stats.avgChannelsPerClient.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Inactive Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.inactiveClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Users with Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.clientsWithChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Users without Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.clientsWithoutChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Filter className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Categories</p>
              <p className="text-2xl font-bold text-foreground">{Object.keys(stats.categories).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Analytics — Real-time Revenue, Views, Subscribers, CPM, RPM */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-foreground">YouTube Analytics (All Clients)</h2>
          </div>
          <DateRangeFilter
            value={datePreset}
            onChange={(p, range) => {
              setDatePreset(p);
              setDateRange(range);
            }}
          />
        </div>
        {/* Token status info */}
        {(() => {
          const validCount = Object.values(tokenStatuses).filter((s) => s.status === "valid").length;
          const totalCount = allChannelIds.length;
          const invalidChannels = allChannelIds.filter((id) => !tokenStatuses[id] || tokenStatuses[id].status !== "valid");
          if (totalCount === 0) return null;
          if (validCount === 0) return (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              {cachedClientData.length > 0 ? (
                <>
                  <strong>Showing cached data.</strong> Live YouTube API tokens not found — displaying last synced data.
                  {syncing && <span className="ml-2 text-xs">(Syncing fresh data...)</span>}
                </>
              ) : (
                <>
                  <strong>No channel tokens found.</strong> Revenue & analytics data requires valid OAuth tokens.
                  Click &quot;Sync YouTube Data&quot; or wait for clients to validate tokens.
                </>
              )}
              <span className="block mt-1 text-xs text-amber-600">
                {totalCount} channel(s) without valid token
              </span>
              {dashData?._debug && Object.keys(dashData._debug.channelTokenErrors).length > 0 && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-medium">Token Details</summary>
                  <ul className="mt-1 space-y-0.5">
                    {Object.entries(dashData._debug.channelTokenErrors).map(([id, err]) => (
                      <li key={id}><code>{id}</code>: {err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
          if (validCount < totalCount) return (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Analytics for <strong>{validCount}</strong> of <strong>{totalCount}</strong> channels.
              {invalidChannels.length > 0 && (
                <span className="block mt-1 text-xs text-blue-600">
                  Token pending: {invalidChannels.map((id) => {
                    const client = clients.find((c) => c.channels.includes(id));
                    return client ? `${id} (${client.name})` : id;
                  }).join(", ")}
                </span>
              )}
            </div>
          );
          return null;
        })()}
        {ytLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted">Loading analytics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium">Revenue</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(ytStats.curEstRevenue)}</p>
              {pctChange(ytStats.curEstRevenue, ytStats.prevEstRevenue) !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  (pctChange(ytStats.curEstRevenue, ytStats.prevEstRevenue) || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {(pctChange(ytStats.curEstRevenue, ytStats.prevEstRevenue) || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(pctChange(ytStats.curEstRevenue, ytStats.prevEstRevenue) || 0).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Views</p>
              <p className="text-xl font-bold text-blue-900">{formatNumber(ytStats.curViews)}</p>
              {pctChange(ytStats.curViews, ytStats.prevViews) !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  (pctChange(ytStats.curViews, ytStats.prevViews) || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {(pctChange(ytStats.curViews, ytStats.prevViews) || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(pctChange(ytStats.curViews, ytStats.prevViews) || 0).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-medium">Subscribers (net)</p>
              <p className="text-xl font-bold text-purple-900">{ytStats.curSubs >= 0 ? "+" : ""}{formatNumber(ytStats.curSubs)}</p>
              {pctChange(ytStats.curSubs, ytStats.prevSubs) !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  (pctChange(ytStats.curSubs, ytStats.prevSubs) || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {(pctChange(ytStats.curSubs, ytStats.prevSubs) || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(pctChange(ytStats.curSubs, ytStats.prevSubs) || 0).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-600 font-medium">CPM</p>
              <p className="text-xl font-bold text-amber-900">{formatCurrency(ytStats.curCPM)}</p>
              {pctChange(ytStats.curCPM, ytStats.prevCPM) !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  (pctChange(ytStats.curCPM, ytStats.prevCPM) || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {(pctChange(ytStats.curCPM, ytStats.prevCPM) || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(pctChange(ytStats.curCPM, ytStats.prevCPM) || 0).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <p className="text-xs text-cyan-600 font-medium">RPM</p>
              <p className="text-xl font-bold text-cyan-900">{formatCurrency(ytStats.curRPM)}</p>
              {pctChange(ytStats.curRPM, ytStats.prevRPM) !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  (pctChange(ytStats.curRPM, ytStats.prevRPM) || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {(pctChange(ytStats.curRPM, ytStats.prevRPM) || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(pctChange(ytStats.curRPM, ytStats.prevRPM) || 0).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-600 font-medium">Total Subscribers</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(ytStats.totalSubscribers)}</p>
              <p className="text-xs text-muted mt-1">All channels</p>
            </div>
          </div>
        )}
      </div>

      {/* Per-Channel Daily Revenue Table */}
      {perChannelDailyRevenue.channels.length > 0 && perChannelDailyRevenue.dates.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Per-Channel Daily Revenue</h2>
            </div>
            <div className="flex items-center gap-1.5">
              {([1, 3, 7, 30, "all"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDailyRevDays(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    dailyRevDays === d
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-muted hover:bg-slate-200"
                  }`}
                >
                  {d === 1 ? "Latest" : d === 30 ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date().getMonth()] : d === "all" ? "All" : `${d} Days`}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium text-muted text-xs">Channel</th>
                  <th className="text-left py-2 pr-3 font-medium text-muted text-xs">Client</th>
                  {perChannelDailyRevenue.dates.map((date) => (
                    <th key={date} className="text-right py-2 px-2 font-medium text-muted text-xs whitespace-nowrap">{date}</th>
                  ))}
                  <th className="text-right py-2 px-2 font-semibold text-amber-700 text-xs whitespace-nowrap">{perChannelDailyRevenue.currentMonthName}</th>
                  <th className="text-right py-2 pl-3 font-semibold text-foreground text-xs">Total</th>
                  <th className="text-right py-2 pl-3 font-semibold text-amber-600 text-xs">INR</th>
                </tr>
              </thead>
              <tbody>
                {perChannelDailyRevenue.channels.map((ch) => {
                  const total = perChannelDailyRevenue.dates.reduce((s, d) => s + (ch.dailyMap[d] || 0), 0);
                  return (
                    <tr key={ch.channelId} className="border-b border-border/50 hover:bg-slate-50">
                      <td className="py-2 pr-3 text-foreground font-medium truncate max-w-[180px]" title={ch.channelName}>{ch.channelName}</td>
                      <td className="py-2 pr-3 text-muted text-xs truncate max-w-[120px]" title={ch.clientName}>{ch.clientName}</td>
                      {perChannelDailyRevenue.dates.map((date) => (
                        <td key={date} className="text-right py-2 px-2 text-muted tabular-nums">
                          ${(ch.dailyMap[date] || 0).toFixed(2)}
                        </td>
                      ))}
                      <td className="text-right py-2 px-2 font-semibold text-amber-700 tabular-nums">${ch.monthTotal.toFixed(2)}</td>
                      <td className="text-right py-2 pl-3 font-semibold text-foreground tabular-nums">${total.toFixed(2)}</td>
                      <td className="text-right py-2 pl-3 font-semibold text-amber-600 tabular-nums">₹{formatNumber(Math.round(total * 83.5))}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-slate-50">
                  <td className="py-2 pr-3 font-bold text-foreground" colSpan={2}>Total</td>
                  {perChannelDailyRevenue.dates.map((date) => {
                    const dayTotal = perChannelDailyRevenue.channels.reduce((s, ch) => s + (ch.dailyMap[date] || 0), 0);
                    return (
                      <td key={date} className="text-right py-2 px-2 font-bold text-foreground tabular-nums">
                        ${dayTotal.toFixed(2)}
                      </td>
                    );
                  })}
                  <td className="text-right py-2 px-2 font-bold text-amber-700 tabular-nums">
                    ${perChannelDailyRevenue.channels.reduce((s, ch) => s + ch.monthTotal, 0).toFixed(2)}
                  </td>
                  {(() => {
                    const grandTotal = perChannelDailyRevenue.channels.reduce((s, ch) =>
                      s + perChannelDailyRevenue.dates.reduce((ss, d) => ss + (ch.dailyMap[d] || 0), 0), 0
                    );
                    return (
                      <>
                        <td className="text-right py-2 pl-3 font-bold text-primary tabular-nums">${grandTotal.toFixed(2)}</td>
                        <td className="text-right py-2 pl-3 font-bold text-amber-600 tabular-nums">₹{formatNumber(Math.round(grandTotal * 83.5))}</td>
                      </>
                    );
                  })()}
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-muted mt-3">YouTube revenue data is ~2 days delayed. Latest available date shown first.</p>
        </div>
      )}

      {/* Top Clients + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients by Channels */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Top Clients</h2>
            </div>
            <span className="text-xs text-muted">By channel count & revenue</span>
          </div>
          <div className="p-4">
            {topClientsByChannels.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">No clients yet</p>
            ) : (
              <div className="space-y-3">
                {topClientsByChannels.map((client, idx) => {
                  const clientCached = cachedClientData.find((cd) => cd.email === client.email);
                  return (
                    <div
                      key={client.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-amber-700" : "bg-slate-300"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                        <p className="text-xs text-muted truncate">{client.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{client.channels.length}</p>
                        <p className="text-xs text-muted">channels</p>
                      </div>
                      {clientCached && clientCached.totalRevenue > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">${clientCached.totalRevenue.toFixed(2)}</p>
                          <p className="text-xs text-muted">revenue</p>
                        </div>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        client.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-foreground">Category Breakdown</h2>
            </div>
            <span className="text-xs text-muted">Client distribution</span>
          </div>
          <div className="p-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">No data</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(([category, count]) => {
                  const pct = stats.totalClients > 0 ? (count / stats.totalClients) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{category}</span>
                        <span className="text-muted">{count} clients ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Clients with Channels — Filterable Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Clients & Channels</h2>
          <button
            onClick={() => router.push("/admin-clients")}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Manage Users →
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border bg-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or channel ID..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Clients</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="with-channels">With Channels</option>
              <option value="without-channels">Without Channels</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">#</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Client
                    {sortBy === "name" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort("channels")}
                >
                  <div className="flex items-center gap-1">
                    Channels
                    {sortBy === "channels" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === "status" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Revenue</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, idx) => (
                <>
                  <tr key={client.id} className="border-b border-border hover:bg-slate-50">
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {client.name[0]}
                        </div>
                        <span className="font-medium text-foreground">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{client.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {client.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Radio className="w-3.5 h-3.5 text-purple-500" />
                        {client.channels.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        client.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {client.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const cc = cachedClientData.find((cd) => cd.email === client.email);
                        if (cc && cc.totalRevenue > 0) {
                          return <span className="font-semibold text-green-600">${cc.totalRevenue.toFixed(2)}</span>;
                        }
                        return <span className="text-muted text-xs">—</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-muted">{client.joinedDate}</td>
                    <td className="px-4 py-3">
                      {client.channels.length > 0 && (
                        <button
                          onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          {expandedClient === client.id ? "Hide" : "View"} Channels
                          {expandedClient === client.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedClient === client.id && client.channels.length > 0 && (
                    <tr key={`${client.id}-channels`} className="bg-slate-50">
                      <td colSpan={9} className="px-8 py-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Channel IDs assigned to {client.name}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {client.channels.map((chId) => {
                              const ts = tokenStatuses[chId];
                              const isValid = ts?.status === "valid";
                              const cached = cachedChannelMap[chId];
                              return (
                                <div
                                  key={chId}
                                  className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-border"
                                >
                                  <div className="flex items-center gap-2">
                                    {cached?.thumbnail ? (
                                      <img src={cached.thumbnail} alt="" className="w-6 h-6 rounded-full shrink-0" />
                                    ) : (
                                      <Radio className="w-4 h-4 text-purple-500 shrink-0" />
                                    )}
                                    <span className="text-sm font-medium text-foreground truncate flex-1">
                                      {cached?.channelTitle || chId}
                                    </span>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                                      isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                      {isValid ? "Token Valid" : "No Token"}
                                    </span>
                                  </div>
                                  {cached && (
                                    <div className="flex gap-3 text-[10px] text-muted pl-6">
                                      <span>{cached.subscribers.toLocaleString()} subs</span>
                                      <span>{cached.views.toLocaleString()} views</span>
                                      {cached.estimatedRevenue > 0 && (
                                        <span className="text-green-600">${cached.estimatedRevenue.toFixed(2)}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No clients found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-slate-50 text-sm text-muted">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/admin-clients")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">Create New User</h3>
          </div>
          <p className="text-sm text-muted">Register a new client with email, password, and channel assignments.</p>
        </button>

        <button
          onClick={() => router.push("/admin-channels")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-foreground">Manage Channels</h3>
          </div>
          <p className="text-sm text-muted">View and manage all YouTube channels across clients.</p>
        </button>

        <button
          onClick={() => router.push("/admin-reports")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-foreground">View Reports</h3>
          </div>
          <p className="text-sm text-muted">Revenue reports and analytics across all clients.</p>
        </button>
      </div>
    </div>
  );
}

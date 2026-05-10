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

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchClients();
    }
  }, [status, session, fetchClients]);

  // Collect all channel IDs from all clients for YouTube data fetching
  const allChannelIds = useMemo(() => {
    return clients.reduce<string[]>((acc, c) => [...acc, ...c.channels], []);
  }, [clients]);

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

  const { data: dashData, loading: ytLoading } = useYouTubeData<DashboardFullData>(
    "dashboardFull",
    ytApiParams,
    {}
  );

  // Aggregate YouTube analytics data
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

    const curCPM = curViews > 0 ? (curEstRevenue / curViews) * 1000 : 0;
    const prevCPM = prevViews > 0 ? (prevEstRevenue / prevViews) * 1000 : 0;
    const curRPM = curViews > 0 ? (curEstRevenue / curViews) * 1000 : 0;
    const prevRPM = prevViews > 0 ? (prevEstRevenue / prevViews) * 1000 : 0;

    const totalSubscribers = (dashData?.channels || []).reduce((sum, ch) => sum + Number(ch?.statistics?.subscriberCount || 0), 0);
    const totalViewsAll = (dashData?.channels || []).reduce((sum, ch) => sum + Number(ch?.statistics?.viewCount || 0), 0);

    return {
      curEstRevenue, prevEstRevenue,
      curViews, prevViews,
      curSubs, prevSubs,
      curCPM, prevCPM,
      curRPM, prevRPM,
      totalSubscribers, totalViewsAll,
    };
  }, [dashData]);

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
        <button
          onClick={fetchClients}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

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
              <strong>No channel tokens found.</strong> Revenue & analytics data requires valid OAuth tokens.
              Clients need to login with Google or validate their channel token via OAuth invite link.
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

      {/* Top Clients + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients by Channels */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Top Clients</h2>
            </div>
            <span className="text-xs text-muted">By channel count</span>
          </div>
          <div className="p-4">
            {topClientsByChannels.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">No clients yet</p>
            ) : (
              <div className="space-y-3">
                {topClientsByChannels.map((client, idx) => (
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      client.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
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
                      <td colSpan={8} className="px-8 py-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Channel IDs assigned to {client.name}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {client.channels.map((chId) => {
                              const ts = tokenStatuses[chId];
                              const isValid = ts?.status === "valid";
                              return (
                                <div
                                  key={chId}
                                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-border"
                                >
                                  <Radio className="w-4 h-4 text-purple-500 shrink-0" />
                                  <span className="text-sm font-mono text-foreground truncate flex-1">{chId}</span>
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                                    isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}>
                                    {isValid ? "Token Valid" : "No Token"}
                                  </span>
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

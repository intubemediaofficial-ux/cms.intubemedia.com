"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Eye,
  Users,
  Play,
  MessageSquare,
  ThumbsUp,
  Wifi,
  WifiOff,
  Loader2,
  Share2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Video,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { signIn, useSession } from "next-auth/react";
import MetricCard from "@/components/dashboard/MetricCard";
import DateRangeFilter, { computeRange } from "@/components/dashboard/DateRangeFilter";
import type { DateRange } from "@/components/dashboard/DateRangeFilter";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";

const CHANNELS_STORAGE_KEY = "bainsla_channels";

interface StoredChannel {
  id: string;
  status: "active" | "delinked" | "transferred";
}

function getActiveChannelIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CHANNELS_STORAGE_KEY);
    if (!stored) return [];
    const channels: StoredChannel[] = JSON.parse(stored);
    return channels
      .filter((c) => c.status === "active")
      .map((c) => c.id);
  } catch {
    return [];
  }
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

interface AnalyticsResponse {
  columnHeaders?: Array<{ name?: string | null }>;
  rows?: Array<Array<string | number>>;
}

interface TopVideoItem {
  id?: string | null;
  snippet?: {
    title?: string | null;
    thumbnails?: {
      medium?: { url?: string | null } | null;
      default?: { url?: string | null } | null;
    } | null;
  } | null;
  statistics?: {
    viewCount?: string | null;
    likeCount?: string | null;
    commentCount?: string | null;
  } | null;
}

interface ChannelRevenueInfo {
  revenue: number;
  views: number;
  rpm: number;
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
  currentPerformance?: AnalyticsResponse | null;
  prevPerformance?: AnalyticsResponse | null;
  currentRevenue?: AnalyticsResponse | null;
  prevRevenue?: AnalyticsResponse | null;
  dailyRevenue?: AnalyticsResponse | null;
  topVideos?: {
    analytics?: AnalyticsResponse | null;
    videos?: TopVideoItem[];
  };
  hasOwnChannel?: boolean;
  channelRevenueMap?: Record<string, ChannelRevenueInfo>;
  lastDayRevenue?: number;
  lastDayDate?: string;
  perChannelAnalytics?: Record<string, PerChannelAnalytics>;
  tokenizedChannels?: string[];
}

function sumMetric(data: AnalyticsResponse | undefined | null, metricName: string): number {
  if (!data?.rows?.length || !data.columnHeaders) return 0;
  const headers = data.columnHeaders.map((h) => h.name || "");
  const idx = headers.indexOf(metricName);
  if (idx === -1) return 0;
  return data.rows.reduce((sum, row) => sum + (Number(row[idx]) || 0), 0);
}

function sumRevenueMetric(data: AnalyticsResponse | undefined | null, metricName: string): number {
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

function getDailyRevenueChartData(data: AnalyticsResponse | null | undefined) {
  if (!data?.rows?.length || !data.columnHeaders) return [];
  const headers = data.columnHeaders.map((h) => h.name || "");
  const dayIdx = headers.indexOf("day");
  const revIdx = headers.indexOf("estimatedRevenue");
  if (dayIdx === -1 || revIdx === -1) return [];
  return data.rows.map((row) => ({
    date: String(row[dayIdx]).slice(5),
    revenue: Math.round((Number(row[revIdx]) || 0) * 100) / 100,
  }));
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const hasAccessToken = !!session?.accessToken;
  const isAdminSession = session?.user?.role === "admin";
  const isAuthenticated = status === "authenticated";

  const [datePreset, setDatePreset] = useState("28d");
  const [dateRange, setDateRange] = useState<DateRange>(() => computeRange("28d"));
  const [activeChannelIds, setActiveChannelIds] = useState<string[]>([]);

  const [serverChannelIds, setServerChannelIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveChannelIds(getActiveChannelIds());
  }, []);

  // Fetch channel IDs from server-side cached data (more reliable than localStorage alone)
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/client-data?action=getAllCachedData")
      .then((r) => r.json())
      .then((j) => {
        const ids: string[] = [];
        for (const cd of (j.data || [])) {
          for (const ch of (cd.channels || [])) {
            if (ch.channelId && !ch.channelId.startsWith("UCtest")) {
              ids.push(ch.channelId);
            }
          }
        }
        setServerChannelIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Merge localStorage + server channel IDs
  const allChannelIds = useMemo(() => {
    const set = new Set([...activeChannelIds, ...serverChannelIds].filter((id) => !id.startsWith("UCtest") && id !== "test"));
    return Array.from(set);
  }, [activeChannelIds, serverChannelIds]);

  // Sync localStorage channels to KV on dashboard load (so admin sees real channel IDs)
  useEffect(() => {
    if (!isAuthenticated || isAdminSession) return;
    const ids = getActiveChannelIds();
    if (ids.length === 0) return;
    fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channels: ids }),
    }).catch(() => {});
  }, [isAuthenticated, isAdminSession]);

  const apiParams = useMemo(() => ({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    prevStartDate: dateRange.prevStartDate,
    prevEndDate: dateRange.prevEndDate,
    ...(allChannelIds.length > 0 ? { channelIds: allChannelIds.join(",") } : {}),
  }), [dateRange, allChannelIds]);

  const { data: dashData, isReal, error, loading } = useYouTubeData<DashboardFullData>(
    "dashboardFull",
    apiParams,
    {}
  );

  const channels = dashData?.channels || [];
  const hasNoChannelsAdded = allChannelIds.length === 0;

  // Cumulative metrics — aggregate across ALL added channels
  const totalViews = channels.reduce((sum, ch) => sum + Number(ch?.statistics?.viewCount || 0), 0);
  const totalSubscribers = channels.reduce((sum, ch) => sum + Number(ch?.statistics?.subscriberCount || 0), 0);
  const totalVideos = channels.reduce((sum, ch) => sum + Number(ch?.statistics?.videoCount || 0), 0);

  // Aggregate per-channel analytics data
  const perChannelAnalytics = dashData?.perChannelAnalytics || {};
  const perChannelEntries = Object.values(perChannelAnalytics);

  // Revenue metrics — aggregate admin's own + all per-channel token data
  let curEstRevenue = sumRevenueMetric(dashData?.currentRevenue, "estimatedRevenue");
  let curAdRevenue = sumRevenueMetric(dashData?.currentRevenue, "estimatedAdRevenue");
  let curGrossRevenue = sumRevenueMetric(dashData?.currentRevenue, "grossRevenue");
  let prevEstRevenue = sumRevenueMetric(dashData?.prevRevenue, "estimatedRevenue");
  let prevAdRevenue = sumRevenueMetric(dashData?.prevRevenue, "estimatedAdRevenue");
  let prevGrossRevenue = sumRevenueMetric(dashData?.prevRevenue, "grossRevenue");

  for (const pca of perChannelEntries) {
    curEstRevenue += sumRevenueMetric(pca.revenue, "estimatedRevenue");
    curAdRevenue += sumRevenueMetric(pca.revenue, "estimatedAdRevenue");
    curGrossRevenue += sumRevenueMetric(pca.revenue, "grossRevenue");
    prevEstRevenue += sumRevenueMetric(pca.prevRevenue, "estimatedRevenue");
    prevAdRevenue += sumRevenueMetric(pca.prevRevenue, "estimatedAdRevenue");
    prevGrossRevenue += sumRevenueMetric(pca.prevRevenue, "grossRevenue");
  }

  const curPremiumRevenue = Math.max(0, curGrossRevenue - curAdRevenue);
  const prevPremiumRevenue = Math.max(0, prevGrossRevenue - prevAdRevenue);

  // Performance metrics — aggregate admin's own + per-channel token data
  let curViews = sumMetric(dashData?.currentPerformance, "views");
  let prevViews = sumMetric(dashData?.prevPerformance, "views");
  let curSubs = sumMetric(dashData?.currentPerformance, "subscribersGained") - sumMetric(dashData?.currentPerformance, "subscribersLost");
  let prevSubs = sumMetric(dashData?.prevPerformance, "subscribersGained") - sumMetric(dashData?.prevPerformance, "subscribersLost");
  let curLikes = sumMetric(dashData?.currentPerformance, "likes");
  let prevLikes = sumMetric(dashData?.prevPerformance, "likes");

  for (const pca of perChannelEntries) {
    curViews += sumMetric(pca.performance, "views");
    prevViews += sumMetric(pca.prevPerformance, "views");
    curSubs += sumMetric(pca.performance, "subscribersGained") - sumMetric(pca.performance, "subscribersLost");
    prevSubs += sumMetric(pca.prevPerformance, "subscribersGained") - sumMetric(pca.prevPerformance, "subscribersLost");
    curLikes += sumMetric(pca.performance, "likes");
    prevLikes += sumMetric(pca.prevPerformance, "likes");
  }


  // CPM and RPM
  const curCPM = curViews > 0 ? (curEstRevenue / curViews) * 1000 : 0;
  const prevCPM = prevViews > 0 ? (prevEstRevenue / prevViews) * 1000 : 0;
  const curRPM = curViews > 0 ? (curEstRevenue / curViews) * 1000 : 0;
  const prevRPM = prevViews > 0 ? (prevEstRevenue / prevViews) * 1000 : 0;

  // Revenue per channel
  const channelCount = channels.length || 1;
  const curRevenuePerChannel = curEstRevenue / channelCount;
  const prevRevenuePerChannel = prevEstRevenue / (channelCount || 1);

  // Videos from performance data
  const curVideos = sumMetric(dashData?.currentPerformance, "videosPublished") || sumMetric(dashData?.currentPerformance, "videos");
  const prevVideosPerf = sumMetric(dashData?.prevPerformance, "videosPublished") || sumMetric(dashData?.prevPerformance, "videos");

  // Daily revenue chart — aggregate admin's own + per-channel token daily data
  const adminDailyData = getDailyRevenueChartData(dashData?.dailyRevenue);
  const perChannelDailyDataArrays = perChannelEntries
    .map((pca) => getDailyRevenueChartData(pca.dailyRevenue))
    .filter((d) => d.length > 0);

  let dailyRevenueData = adminDailyData;
  if (perChannelDailyDataArrays.length > 0) {
    const dailyMap: Record<string, number> = {};
    for (const d of adminDailyData) dailyMap[d.date] = (dailyMap[d.date] || 0) + d.revenue;
    for (const arr of perChannelDailyDataArrays) {
      for (const d of arr) dailyMap[d.date] = (dailyMap[d.date] || 0) + d.revenue;
    }
    dailyRevenueData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
  }

  const avgDailyRevenue = dailyRevenueData.length > 0
    ? dailyRevenueData.reduce((s, d) => s + d.revenue, 0) / dailyRevenueData.length
    : 0;

  // Top videos
  const topVideos = isReal ? (dashData?.topVideos?.videos || []) : [];
  const topVideoAnalytics = dashData?.topVideos?.analytics;
  const videoAnalyticsMap: Record<string, { views: number; likes: number; subs: number }> = {};
  if (topVideoAnalytics?.rows && topVideoAnalytics.columnHeaders) {
    const headers = topVideoAnalytics.columnHeaders.map((h) => h.name || "");
    const videoIdx = headers.indexOf("video");
    const viewsIdx = headers.indexOf("views");
    const likesIdx = headers.indexOf("likes");
    const subsIdx = headers.indexOf("subscribersGained");
    for (const row of topVideoAnalytics.rows) {
      const videoId = String(row[videoIdx]);
      videoAnalyticsMap[videoId] = {
        views: viewsIdx !== -1 ? Number(row[viewsIdx]) || 0 : 0,
        likes: likesIdx !== -1 ? Number(row[likesIdx]) || 0 : 0,
        subs: subsIdx !== -1 ? Number(row[subsIdx]) || 0 : 0,
      };
    }
  }

  // Sort top videos by different metrics for leaderboards
  const videosSortedByViews = [...topVideos]
    .map((v) => ({ ...v, analyticsViews: videoAnalyticsMap[v.id || ""]?.views || Number(v.statistics?.viewCount || 0) }))
    .sort((a, b) => b.analyticsViews - a.analyticsViews)
    .slice(0, 5);
  const videosSortedBySubs = [...topVideos]
    .map((v) => ({ ...v, analyticsSubs: videoAnalyticsMap[v.id || ""]?.subs || 0 }))
    .sort((a, b) => b.analyticsSubs - a.analyticsSubs)
    .slice(0, 5);

  // Channel leaderboard data
  const channelRevenueMap = dashData?.channelRevenueMap || {};
  const lastDayRevenue = dashData?.lastDayRevenue || 0;
  const lastDayDate = dashData?.lastDayDate || "";

  // Revenue Channels (channels that have revenue > 0)
  const curRevenueChannels = Object.values(channelRevenueMap).filter((info) => info.revenue > 0).length;

  // Carry Forward Revenue = total revenue from channels linked before this period
  const curCarryForwardRevenue = curEstRevenue;
  const prevCarryForwardRevenue = prevEstRevenue;

  // New Channel Revenue = revenue from newly linked channels in this period
  const curNewChannelRevenue = 0;
  const prevNewChannelRevenue = 0;

  // New Linked Channels = channels added in the selected date range
  const newLinkedChannels = 0;

  // Revenue Per New Channel
  const curRevenuePerNewChannel = newLinkedChannels > 0 ? curNewChannelRevenue / newLinkedChannels : 0;
  const prevRevenuePerNewChannel = 0;

  // Top 5 Channels by Revenue Generated
  const channelsSortedByRevenue = [...channels]
    .map((ch) => ({
      ...ch,
      channelRevenue: channelRevenueMap[ch.id || ""]?.revenue || 0,
    }))
    .sort((a, b) => b.channelRevenue - a.channelRevenue)
    .slice(0, 5);

  // Top 5 Channels by RPM
  const channelsSortedByRPM = [...channels]
    .map((ch) => {
      const revInfo = channelRevenueMap[ch.id || ""];
      const views = Number(ch.statistics?.viewCount || 0);
      const rpm = revInfo ? revInfo.rpm : (views > 0 && curEstRevenue > 0 ? (curEstRevenue / views) * 1000 : 0);
      return { ...ch, channelRPM: rpm };
    })
    .sort((a, b) => b.channelRPM - a.channelRPM)
    .slice(0, 5);

  // Top 5 Channels by Videos Published
  const channelsSortedByVideos = [...channels]
    .map((ch) => ({
      ...ch,
      totalVideos: Number(ch.statistics?.videoCount || 0),
    }))
    .sort((a, b) => b.totalVideos - a.totalVideos)
    .slice(0, 5);

  const displayStart = dateRange.startDate.split("-").reverse().join("-");
  const displayEnd = dateRange.endDate.split("-").reverse().join("-");
  const prevDisplayStart = dateRange.prevStartDate.split("-").reverse().join("-");
  const prevDisplayEnd = dateRange.prevEndDate.split("-").reverse().join("-");

  const handleDateChange = (preset: string, range: DateRange) => {
    setDatePreset(preset);
    setDateRange(range);
  };

  // Auto-cache client YouTube data to KV for admin access
  const cacheData = useCallback(async () => {
    if (!session?.user?.email || isAdminSession || !isReal || channels.length === 0) return;
    try {
      const cachedChannels = channels.map((ch) => {
        const revInfo = channelRevenueMap[ch.id || ""];
        return {
          channelId: ch.id || "",
          channelTitle: ch.snippet?.title || "",
          thumbnail: ch.snippet?.thumbnails?.default?.url || "",
          subscribers: Number(ch.statistics?.subscriberCount || 0),
          views: Number(ch.statistics?.viewCount || 0),
          videoCount: Number(ch.statistics?.videoCount || 0),
          estimatedRevenue: revInfo?.revenue || 0,
          rpm: revInfo?.rpm || 0,
          cpm: 0,
          lastUpdated: new Date().toISOString(),
        };
      });
      await fetch("/api/client-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cacheData",
          userId: session.user.email,
          data: {
            userId: session.user.email,
            email: session.user.email,
            channels: cachedChannels,
            totalRevenue: curEstRevenue,
            totalViews,
            totalSubscribers,
            lastUpdated: new Date().toISOString(),
          },
        }),
      });
    } catch { /* silent */ }
  }, [session?.user?.email, isAdminSession, isReal, channels, channelRevenueMap, curEstRevenue, totalViews, totalSubscribers]);

  useEffect(() => {
    cacheData();
  }, [cacheData]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          {isAuthenticated && activeChannelIds.length > 0 && (
            <p className="text-xs text-muted mt-0.5">
              Showing data for {activeChannelIds.length} added channel{activeChannelIds.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && isReal && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              <Wifi className="w-3.5 h-3.5" />
              Live YouTube Data
            </div>
          )}
          {isAuthenticated && loading && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading...
            </div>
          )}
          {!isAuthenticated && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff className="w-3.5 h-3.5" />
              Sign in to see data
            </div>
          )}
          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg text-muted hover:bg-slate-50 transition-colors"
            title="Share dashboard"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Not authenticated */}
      {!isAuthenticated && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <WifiOff className="w-10 h-10 text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Data</h3>
            <p className="text-sm text-muted mb-4">Sign in with Google to see your YouTube channel data</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted">Loading your YouTube data...</p>
          </div>
        </div>
      )}

      {isAuthenticated && !loading && hasNoChannelsAdded && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Channels Added</h3>
            <p className="text-sm text-muted mb-4">
              Dashboard sirf added channels ka data dikhata hai. Pehle Channels section mein channels add karo.
            </p>
            <a
              href="/channels"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors inline-block"
            >
              Go to Channels
            </a>
          </div>
        </div>
      )}

      {isAuthenticated && !loading && !hasNoChannelsAdded && !isReal && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Could Not Load Data</h3>
            <p className="text-sm text-muted mb-4">{error || "YouTube API returned no data. Please try again."}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              {hasAccessToken && (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                >
                  Re-authenticate with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && !loading && !hasNoChannelsAdded && isReal && (
        <>
          {/* ===== SECTION 1: Cumulative Metrics (date-independent) ===== */}
          <div className="bg-slate-50 rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Cumulative Metrics <span className="text-xs font-normal text-muted">(Aggregated across {channels.length} added channel{channels.length !== 1 ? "s" : ""})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <MetricCard
                title="Estimated Revenue"
                value={formatCurrency(curEstRevenue)}
                tooltip="Total estimated revenue across all time for the selected period"
                color="#f59e0b"
              />
              <MetricCard
                title="Ad Revenue"
                value={formatCurrency(curAdRevenue)}
                tooltip="Revenue from ads shown on your videos"
                color="#3b82f6"
              />
              <MetricCard
                title="Premium Revenue"
                value={formatCurrency(curPremiumRevenue)}
                tooltip="Revenue from YouTube Premium viewers"
                color="#22c55e"
              />
              <MetricCard
                title="Avg CPM"
                value={formatCurrency(curCPM)}
                tooltip="Average cost per 1000 impressions"
                color="#8b5cf6"
              />
              <MetricCard
                title="Avg RPM"
                value={formatCurrency(curRPM)}
                tooltip="Average revenue per 1000 views"
                color="#ec4899"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
              <MetricCard
                title="Total Channels"
                value={String(channelCount)}
                tooltip="Number of YouTube channels linked"
                color="#06b6d4"
              />
              <MetricCard
                title="Revenue Per Channel"
                value={formatCurrency(curRevenuePerChannel)}
                tooltip="Average revenue per channel"
                color="#f97316"
              />
              <MetricCard
                title="Videos"
                value={formatNumber(totalVideos)}
                tooltip="Total number of videos on your channel(s)"
                color="#84cc16"
              />
              <MetricCard
                title="Views"
                value={formatNumber(totalViews)}
                tooltip="Total lifetime views across all channels"
                color="#eab308"
              />
              <MetricCard
                title="Subscribers"
                value={formatNumber(totalSubscribers)}
                tooltip="Total subscribers across all channels"
                color="#14b8a6"
              />
            </div>
            {/* Last Day Revenue */}
            {lastDayRevenue > 0 && (
              <div className="mt-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Last Day Revenue</span>
                    {lastDayDate && (
                      <span className="text-xs text-amber-600">({lastDayDate})</span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-amber-700">{formatCurrency(lastDayRevenue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ===== NOTE ===== */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-700">
            <span className="font-semibold shrink-0">Note:</span>
            <span>All date ranges end at {displayEnd} (today minus 3 days) due to YouTube&apos;s data reporting delay.</span>
          </div>

          {/* ===== DATE RANGE FILTER ===== */}
          <DateRangeFilter value={datePreset} onChange={handleDateChange} />

          {/* ===== SECTION 2: Performance Overview (with % change) ===== */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Performance Overview
              <span className="text-xs font-normal text-muted ml-2">
                (Current: {dateRange.label} - {displayStart} to {displayEnd} | Prev: {prevDisplayStart} to {prevDisplayEnd})
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
              <MetricCard
                title="Estimated Revenue"
                value={formatCurrency(curEstRevenue)}
                change={pctChange(curEstRevenue, prevEstRevenue)}
                tooltip="Estimated revenue in selected period"
                color="#f59e0b"
              />
              <MetricCard
                title="Ad Revenue"
                value={formatCurrency(curAdRevenue)}
                change={pctChange(curAdRevenue, prevAdRevenue)}
                tooltip="Ad revenue in selected period"
                color="#3b82f6"
              />
              <MetricCard
                title="Premium Revenue"
                value={formatCurrency(curPremiumRevenue)}
                change={pctChange(curPremiumRevenue, prevPremiumRevenue)}
                tooltip="YouTube Premium revenue in selected period"
                color="#22c55e"
              />
              <MetricCard
                title="Avg CPM"
                value={formatCurrency(curCPM)}
                change={pctChange(curCPM, prevCPM)}
                tooltip="Average CPM in selected period"
                color="#8b5cf6"
              />
              <MetricCard
                title="Avg RPM"
                value={formatCurrency(curRPM)}
                change={pctChange(curRPM, prevRPM)}
                tooltip="Average RPM in selected period"
                color="#ec4899"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
              <MetricCard
                title="New Linked Channels"
                value={String(newLinkedChannels)}
                change={pctChange(newLinkedChannels, 0)}
                tooltip="New channels linked during the selected period"
                color="#06b6d4"
              />
              <MetricCard
                title="Revenue Channels"
                value={String(curRevenueChannels)}
                change={null}
                tooltip="Channels with revenue > $0 in selected period"
                color="#f97316"
              />
              <MetricCard
                title="New Channel Revenue"
                value={formatCurrency(curNewChannelRevenue)}
                change={pctChange(curNewChannelRevenue, prevNewChannelRevenue)}
                tooltip="Revenue from newly linked channels in this period"
                color="#22c55e"
              />
              <MetricCard
                title="Carry Forward Revenue"
                value={formatCurrency(curCarryForwardRevenue)}
                change={pctChange(curCarryForwardRevenue, prevCarryForwardRevenue)}
                tooltip="Revenue from channels linked before this period"
                color="#8b5cf6"
              />
              <MetricCard
                title="Revenue Per Channel"
                value={formatCurrency(curRevenuePerChannel)}
                change={pctChange(curRevenuePerChannel, prevRevenuePerChannel)}
                tooltip="Average revenue per channel in selected period"
                color="#ec4899"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
              <MetricCard
                title="Revenue Per New Channel"
                value={formatCurrency(curRevenuePerNewChannel)}
                change={pctChange(curRevenuePerNewChannel, prevRevenuePerNewChannel)}
                tooltip="Average revenue per newly linked channel"
                color="#f59e0b"
              />
              <MetricCard
                title="Views"
                value={formatNumber(curViews)}
                change={pctChange(curViews, prevViews)}
                tooltip="Total views in selected period"
                color="#eab308"
              />
              <MetricCard
                title="Subscribers"
                value={formatNumber(curSubs)}
                change={pctChange(curSubs, prevSubs)}
                tooltip="Net subscribers gained in selected period"
                color="#14b8a6"
              />
              <MetricCard
                title="Likes"
                value={formatNumber(curLikes)}
                change={pctChange(curLikes, prevLikes)}
                tooltip="Total likes in selected period"
                color="#ef4444"
              />
              <MetricCard
                title="Videos"
                value={formatNumber(curVideos || totalVideos)}
                change={pctChange(curVideos || totalVideos, prevVideosPerf || totalVideos)}
                tooltip="Total videos published in selected period"
                color="#06b6d4"
              />
            </div>
          </div>

          {/* ===== SECTION 3: Top 5 Leaderboards ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top 5 by Revenue */}
            {curEstRevenue > 0 && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <span className="text-amber-500">$</span>
                  Top 5 Videos by Revenue
                </h3>
                <div className="space-y-2">
                  {videosSortedByViews.slice(0, 5).map((video, i) => {
                    const thumbnail = video.snippet?.thumbnails?.default?.url || "";
                    const revenue = videoAnalyticsMap[video.id || ""]?.views || 0;
                    return (
                      <div key={video.id || i} className="flex items-center gap-3 py-1.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-muted"}`}>
                          {i + 1}
                        </span>
                        {thumbnail && <img src={thumbnail} alt="" className="w-8 h-8 rounded-full object-cover" />}
                        <span className="flex-1 text-sm text-foreground truncate">{video.snippet?.title || "Untitled"}</span>
                        <span className="text-sm font-semibold text-foreground">{formatNumber(revenue)} views</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top 5 by Views */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                Top 5 Videos by Views
              </h3>
              <div className="space-y-2">
                {videosSortedByViews.slice(0, 5).map((video, i) => {
                  const thumbnail = video.snippet?.thumbnails?.default?.url || "";
                  return (
                    <div key={video.id || i} className="flex items-center gap-3 py-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-muted"}`}>
                        {i + 1}
                      </span>
                      {thumbnail && <img src={thumbnail} alt="" className="w-8 h-8 rounded-full object-cover" />}
                      <span className="flex-1 text-sm text-foreground truncate">{video.snippet?.title || "Untitled"}</span>
                      <span className="text-sm font-semibold text-foreground">{formatNumber(video.analyticsViews)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 by Subscriber Gain */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Top 5 Videos by Subscriber Gain
              </h3>
              <div className="space-y-2">
                {videosSortedBySubs.slice(0, 5).map((video, i) => {
                  const thumbnail = video.snippet?.thumbnails?.default?.url || "";
                  return (
                    <div key={video.id || i} className="flex items-center gap-3 py-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-muted"}`}>
                        {i + 1}
                      </span>
                      {thumbnail && <img src={thumbnail} alt="" className="w-8 h-8 rounded-full object-cover" />}
                      <span className="flex-1 text-sm text-foreground truncate">{video.snippet?.title || "Untitled"}</span>
                      <span className="text-sm font-semibold text-foreground">{formatNumber(video.analyticsSubs)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===== SECTION 3B: Top 5 Channel Leaderboards ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top 5 Channels by Revenue Generated */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Top 5 Channels by Revenue
              </h3>
              <div className="space-y-2">
                {channelsSortedByRevenue.length > 0 ? channelsSortedByRevenue.map((ch, i) => {
                  const thumbnail = ch.snippet?.thumbnails?.default?.url || "";
                  return (
                    <div key={ch.id || i} className="flex items-center gap-3 py-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-muted"}`}>
                        {i + 1}
                      </span>
                      {thumbnail && <img src={thumbnail} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />}
                      <span className="flex-1 text-sm text-foreground truncate">{ch.snippet?.title || "Unknown"}</span>
                      <span className="text-sm font-semibold text-amber-600">{formatCurrency(ch.channelRevenue)}</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted py-4 text-center">No revenue data available</p>
                )}
              </div>
            </div>

            {/* Top 5 Channels by RPM */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Top 5 Channels by RPM
              </h3>
              <div className="space-y-2">
                {channelsSortedByRPM.length > 0 ? channelsSortedByRPM.map((ch, i) => {
                  const thumbnail = ch.snippet?.thumbnails?.default?.url || "";
                  return (
                    <div key={ch.id || i} className="flex items-center gap-3 py-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-muted"}`}>
                        {i + 1}
                      </span>
                      {thumbnail && <img src={thumbnail} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />}
                      <span className="flex-1 text-sm text-foreground truncate">{ch.snippet?.title || "Unknown"}</span>
                      <span className="text-sm font-semibold text-purple-600">{formatCurrency(ch.channelRPM)}</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted py-4 text-center">No RPM data available</p>
                )}
              </div>
            </div>

            {/* Top 5 Channels by Videos Published */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                Top 5 Channels by Videos Published
              </h3>
              <div className="space-y-2">
                {channelsSortedByVideos.length > 0 ? channelsSortedByVideos.map((ch, i) => {
                  const thumbnail = ch.snippet?.thumbnails?.default?.url || "";
                  return (
                    <div key={ch.id || i} className="flex items-center gap-3 py-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-muted"}`}>
                        {i + 1}
                      </span>
                      {thumbnail && <img src={thumbnail} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />}
                      <span className="flex-1 text-sm text-foreground truncate">{ch.snippet?.title || "Unknown"}</span>
                      <span className="text-sm font-semibold text-red-600">{formatNumber(ch.totalVideos)} videos</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted py-4 text-center">No channels found</p>
                )}
              </div>
            </div>
          </div>

          {/* ===== SECTION 4: Revenue Trend Chart ===== */}
          {dailyRevenueData.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-sm">Revenue Trend</h3>
                <span className="text-xs text-muted">{dateRange.label}</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                    />
                    <ReferenceLine
                      y={avgDailyRevenue}
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      label={{ value: `Avg: $${avgDailyRevenue.toFixed(2)}`, fill: "#64748b", fontSize: 11, position: "right" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ===== SECTION 5: Top Videos Table ===== */}
          {topVideos.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Top Performing Videos</h3>
                <a href="/videos" className="text-sm text-accent hover:underline">View all</a>
              </div>
              <div className="space-y-3">
                {topVideos.slice(0, 10).map((video, index) => {
                  const analyticsRow = videoAnalyticsMap[video.id || ""];
                  const views = analyticsRow?.views || Number(video.statistics?.viewCount || 0);
                  const likes = analyticsRow?.likes || Number(video.statistics?.likeCount || 0);
                  const comments = Number(video.statistics?.commentCount || 0);
                  const thumbnail = video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || "";

                  return (
                    <div
                      key={video.id || index}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-muted w-6">{index + 1}</span>
                      <div className="w-24 h-14 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        {thumbnail && <img src={thumbnail} alt={video.snippet?.title || ""} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{video.snippet?.title || "Untitled"}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Play className="w-3 h-3" />{formatNumber(views)}
                          </span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />{formatNumber(likes)}
                          </span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />{formatNumber(comments)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

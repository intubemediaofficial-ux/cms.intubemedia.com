"use client";

import {
  Eye,
  Users,
  Video,
  Clock,
  Play,
  MessageSquare,
  ThumbsUp,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import StatsCard from "@/components/dashboard/StatsCard";
import ViewsChart from "@/components/charts/ViewsChart";
import SubscriberChart from "@/components/charts/SubscriberChart";
import { formatNumber } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DashboardChannel {
  snippet?: { title?: string | null };
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

interface DashboardData {
  channels?: DashboardChannel[];
  analytics?: AnalyticsResponse;
  topVideos?: {
    analytics?: AnalyticsResponse;
    videos?: TopVideoItem[];
  };
}

function transformAnalyticsToViewsData(analytics: AnalyticsResponse | undefined) {
  if (!analytics?.rows?.length || !analytics.columnHeaders) return [];

  const headers = analytics.columnHeaders.map((h) => h.name || "");
  const monthIdx = headers.indexOf("month");
  const viewsIdx = headers.indexOf("views");

  if (monthIdx === -1 || viewsIdx === -1) return [];

  return analytics.rows.map((row) => {
    const monthStr = String(row[monthIdx]);
    const monthNum = parseInt(monthStr.split("-")[1] || monthStr, 10);
    return {
      date: MONTHS[monthNum - 1] || monthStr,
      views: Number(row[viewsIdx]) || 0,
    };
  });
}

function transformAnalyticsToSubscriberData(analytics: AnalyticsResponse | undefined) {
  if (!analytics?.rows?.length || !analytics.columnHeaders) return [];

  const headers = analytics.columnHeaders.map((h) => h.name || "");
  const monthIdx = headers.indexOf("month");
  const gainedIdx = headers.indexOf("subscribersGained");
  const lostIdx = headers.indexOf("subscribersLost");

  if (monthIdx === -1 || gainedIdx === -1) return [];

  let cumulativeNet = 0;
  return analytics.rows.map((row) => {
    const monthStr = String(row[monthIdx]);
    const monthNum = parseInt(monthStr.split("-")[1] || monthStr, 10);
    const gained = Number(row[gainedIdx]) || 0;
    const lost = lostIdx !== -1 ? Number(row[lostIdx]) || 0 : 0;
    cumulativeNet += gained - lost;
    return {
      date: MONTHS[monthNum - 1] || monthStr,
      subscribers: cumulativeNet,
    };
  });
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: dashboardData, isReal, error, loading } = useYouTubeData<DashboardData>(
    "dashboard",
    {},
    {}
  );

  const channel = dashboardData?.channels?.[0];
  const isAuthenticated = status === "authenticated" && !!session?.accessToken;

  const viewsChartData = isReal ? transformAnalyticsToViewsData(dashboardData?.analytics) : undefined;
  const subscriberChartData = isReal ? transformAnalyticsToSubscriberData(dashboardData?.analytics) : undefined;

  const topVideos = isReal ? (dashboardData?.topVideos?.videos || []) : [];
  const topVideoAnalytics = dashboardData?.topVideos?.analytics;
  const videoAnalyticsMap: Record<string, { views: number; likes: number }> = {};
  if (topVideoAnalytics?.rows && topVideoAnalytics.columnHeaders) {
    const headers = topVideoAnalytics.columnHeaders.map((h) => h.name || "");
    const videoIdx = headers.indexOf("video");
    const viewsIdx = headers.indexOf("views");
    const likesIdx = headers.indexOf("likes");
    for (const row of topVideoAnalytics.rows) {
      const videoId = String(row[videoIdx]);
      videoAnalyticsMap[videoId] = {
        views: viewsIdx !== -1 ? Number(row[viewsIdx]) || 0 : 0,
        likes: likesIdx !== -1 ? Number(row[likesIdx]) || 0 : 0,
      };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Welcome back, {isReal && channel?.snippet?.title ? channel.snippet.title : ""}. Here&apos;s your channel overview.
          </p>
        </div>
        {isAuthenticated && isReal && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            <Wifi className="w-3.5 h-3.5" />
            Live YouTube Data
          </div>
        )}
        {isAuthenticated && !isReal && !loading && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              <WifiOff className="w-3.5 h-3.5" />
              {error || "Could not load YouTube data"}
            </span>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Re-authenticate
            </button>
          </div>
        )}
        {isAuthenticated && loading && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading YouTube Data...
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <WifiOff className="w-3.5 h-3.5" />
            Sign in with Google to see data
          </div>
        )}
      </div>

      {isAuthenticated && loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted">Loading your YouTube data...</p>
          </div>
        </div>
      )}

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

      {isAuthenticated && !loading && isReal && channel?.statistics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatsCard
              title="Total Views"
              value={formatNumber(Number(channel.statistics.viewCount || 0))}
              change="From YouTube"
              changeType="positive"
              icon={Eye}
              iconColor="#f59e0b"
              iconBg="#fef3c7"
            />
            <StatsCard
              title="Subscribers"
              value={formatNumber(Number(channel.statistics.subscriberCount || 0))}
              change="From YouTube"
              changeType="positive"
              icon={Users}
              iconColor="#3b82f6"
              iconBg="#dbeafe"
            />
            <StatsCard
              title="Total Videos"
              value={formatNumber(Number(channel.statistics.videoCount || 0))}
              change="From YouTube"
              changeType="neutral"
              icon={Video}
              iconColor="#8b5cf6"
              iconBg="#ede9fe"
            />
            {viewsChartData && viewsChartData.length > 0 && (
              <StatsCard
                title="Watch Time"
                value={(() => {
                  if (!dashboardData?.analytics?.rows?.length || !dashboardData.analytics.columnHeaders) return "0 hrs";
                  const headers = dashboardData.analytics.columnHeaders.map((h) => h.name || "");
                  const wtIdx = headers.indexOf("estimatedMinutesWatched");
                  if (wtIdx === -1) return "0 hrs";
                  const totalMinutes = dashboardData.analytics.rows.reduce((sum, row) => sum + (Number(row[wtIdx]) || 0), 0);
                  return formatNumber(Math.round(totalMinutes / 60)) + " hrs";
                })()}
                change="From YouTube Analytics"
                changeType="positive"
                icon={Clock}
                iconColor="#22c55e"
                iconBg="#dcfce7"
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViewsChart data={viewsChartData} />
            <SubscriberChart data={subscriberChartData} />
          </div>

          {topVideos.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Top Performing Videos</h3>
                <a href="/videos" className="text-sm text-accent hover:underline">
                  View all
                </a>
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
                      <span className="text-sm font-bold text-muted w-6">
                        {index + 1}
                      </span>
                      <div className="w-24 h-14 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        {thumbnail && (
                          <img
                            src={thumbnail}
                            alt={video.snippet?.title || ""}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {video.snippet?.title || "Untitled"}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {formatNumber(views)}
                          </span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {formatNumber(likes)}
                          </span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {formatNumber(comments)}
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

      {isAuthenticated && !loading && !isReal && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Could Not Load Data</h3>
            <p className="text-sm text-muted mb-4">{error || "YouTube API returned no data. Try re-authenticating."}</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Re-authenticate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

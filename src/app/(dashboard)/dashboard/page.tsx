"use client";

import {
  Eye,
  Users,
  Video,
  Clock,
  DollarSign,
  TrendingUp,
  Play,
  MessageSquare,
  ThumbsUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/dashboard/StatsCard";
import ViewsChart from "@/components/charts/ViewsChart";
import SubscriberChart from "@/components/charts/SubscriberChart";
import RevenueChart from "@/components/charts/RevenueChart";
import {
  channelStats as mockStats,
  topVideos as mockTopVideos,
  recentActivity,
} from "@/lib/mock-data";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: channelsData, isReal, error, loading } = useYouTubeData<
    Array<{
      snippet?: { title?: string | null };
      statistics?: {
        viewCount?: string | null;
        subscriberCount?: string | null;
        videoCount?: string | null;
      };
    }>
  >("channels", {}, []);

  const channel = channelsData?.[0];
  const stats = isReal && channel?.statistics
    ? {
        totalViews: Number(channel.statistics.viewCount || 0),
        totalSubscribers: Number(channel.statistics.subscriberCount || 0),
        totalVideos: Number(channel.statistics.videoCount || 0),
        totalWatchTime: mockStats.totalWatchTime,
        revenue: mockStats.revenue,
        estimatedRPM: mockStats.estimatedRPM,
      }
    : mockStats;

  const isAuthenticated = status === "authenticated" && !!session?.accessToken;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Welcome back, {isReal && channel?.snippet?.title ? channel.snippet.title : "Bainsla Music"}. Here&apos;s your channel overview.
          </p>
        </div>
        {isAuthenticated && isReal && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            <Wifi className="w-3.5 h-3.5" />
            Live YouTube Data
          </div>
        )}
        {isAuthenticated && !isReal && !loading && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <WifiOff className="w-3.5 h-3.5" />
            {error || "Could not load YouTube data"}
          </div>
        )}
        {isAuthenticated && loading && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Wifi className="w-3.5 h-3.5" />
            Loading YouTube Data...
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <WifiOff className="w-3.5 h-3.5" />
            Demo Data — Sign in with Google for real data
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Views"
          value={formatNumber(stats.totalViews)}
          change="+12.5% from last month"
          changeType="positive"
          icon={Eye}
          iconColor="#f59e0b"
          iconBg="#fef3c7"
        />
        <StatsCard
          title="Subscribers"
          value={formatNumber(stats.totalSubscribers)}
          change="+3.2% from last month"
          changeType="positive"
          icon={Users}
          iconColor="#3b82f6"
          iconBg="#dbeafe"
        />
        <StatsCard
          title="Total Videos"
          value={formatNumber(stats.totalVideos)}
          change="+8 new this month"
          changeType="neutral"
          icon={Video}
          iconColor="#8b5cf6"
          iconBg="#ede9fe"
        />
        <StatsCard
          title="Watch Time"
          value={formatNumber(stats.totalWatchTime) + " hrs"}
          change="+8.7% from last month"
          changeType="positive"
          icon={Clock}
          iconColor="#22c55e"
          iconBg="#dcfce7"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          change="+15.3% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="#ef4444"
          iconBg="#fee2e2"
        />
        <StatsCard
          title="Est. RPM"
          value={"$" + stats.estimatedRPM}
          change="+2.1% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="#14b8a6"
          iconBg="#ccfbf1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsChart />
        <SubscriberChart />
      </div>

      <RevenueChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Top Performing Videos</h3>
            <a href="/videos" className="text-sm text-accent hover:underline">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {mockTopVideos.slice(0, 5).map((video, index) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-muted w-6">
                  {index + 1}
                </span>
                <div className="w-24 h-14 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {formatNumber(video.views)}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatNumber(video.likes)}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {formatNumber(video.comments)}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-success">
                    {formatCurrency(video.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{activity.detail}</p>
                  <p className="text-xs text-muted-light mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

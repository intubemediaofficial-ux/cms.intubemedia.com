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
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ViewsChart from "@/components/charts/ViewsChart";
import SubscriberChart from "@/components/charts/SubscriberChart";
import RevenueChart from "@/components/charts/RevenueChart";
import { channelStats, topVideos, recentActivity } from "@/lib/mock-data";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Welcome back, Bainsla Music. Here&apos;s your channel overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Views"
          value={formatNumber(channelStats.totalViews)}
          change="+12.5% from last month"
          changeType="positive"
          icon={Eye}
          iconColor="#f59e0b"
          iconBg="#fef3c7"
        />
        <StatsCard
          title="Subscribers"
          value={formatNumber(channelStats.totalSubscribers)}
          change="+3.2% from last month"
          changeType="positive"
          icon={Users}
          iconColor="#3b82f6"
          iconBg="#dbeafe"
        />
        <StatsCard
          title="Total Videos"
          value={formatNumber(channelStats.totalVideos)}
          change="+8 new this month"
          changeType="neutral"
          icon={Video}
          iconColor="#8b5cf6"
          iconBg="#ede9fe"
        />
        <StatsCard
          title="Watch Time"
          value={formatNumber(channelStats.totalWatchTime) + " hrs"}
          change="+8.7% from last month"
          changeType="positive"
          icon={Clock}
          iconColor="#22c55e"
          iconBg="#dcfce7"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(channelStats.revenue)}
          change="+15.3% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="#ef4444"
          iconBg="#fee2e2"
        />
        <StatsCard
          title="Est. RPM"
          value={"$" + channelStats.estimatedRPM}
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
            {topVideos.slice(0, 5).map((video, index) => (
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

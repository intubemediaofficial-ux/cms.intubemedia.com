"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Radio,
  TrendingUp,
  Package,
  FileVideo,
  Shield,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
  BarChart3,
} from "lucide-react";

interface IssueRow {
  label: string;
  count: number;
  href: string;
}

const issueRows: IssueRow[] = [
  { label: "Reference overlaps", count: 0, href: "/cms-issues?type=reference-overlaps" },
  { label: "Invalid references", count: 0, href: "/cms-issues?type=invalid-references" },
  { label: "Ownership conflicts", count: 0, href: "/cms-issues?type=ownership-conflicts" },
  { label: "Ownership transfers", count: 0, href: "/cms-issues?type=ownership-transfers" },
  { label: "Potential claims", count: 1, href: "/cms-issues?type=potential-claims" },
  { label: "Disputed claims", count: 0, href: "/cms-issues?type=disputed-claims" },
  { label: "Appealed claims", count: 0, href: "/cms-issues?type=appealed-claims" },
];

interface ChannelOverviewRow {
  label: string;
  count: number;
  href: string;
}

const channelOverviewRows: ChannelOverviewRow[] = [
  { label: "Active channels with copyright strikes", count: 0, href: "/cms-channels?filter=copyright-strikes" },
  { label: "Pending invites", count: 0, href: "/cms-channels?filter=pending-invites" },
  { label: "Not monetizing", count: 7, href: "/cms-channels?filter=not-monetizing" },
];

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const quickStats: QuickStat[] = [
  { label: "Total Assets", value: "1,245", change: "+12 this week", trend: "up", icon: Package, href: "/cms-assets" },
  { label: "Active Claims", value: "328", change: "+5 today", trend: "up", icon: FileVideo, href: "/cms-claimed-videos" },
  { label: "Active Channels", value: "14", change: "2 pending", trend: "neutral", icon: Radio, href: "/cms-channels" },
  { label: "Est. Revenue (30d)", value: "$4,520", change: "+8.2%", trend: "up", icon: TrendingUp, href: "/cms-analytics" },
];

interface RecentActivity {
  id: string;
  type: "claim" | "channel" | "asset" | "policy";
  message: string;
  time: string;
}

const recentActivities: RecentActivity[] = [
  { id: "1", type: "claim", message: "New potential claim on \"Tere Bina\" — awaiting review", time: "2 hours ago" },
  { id: "2", type: "channel", message: "Channel \"Bainsla Official\" monetization approved", time: "5 hours ago" },
  { id: "3", type: "asset", message: "15 new sound recordings uploaded via package", time: "1 day ago" },
  { id: "4", type: "policy", message: "Match policy \"Monetize All\" updated for music assets", time: "2 days ago" },
  { id: "5", type: "channel", message: "Channel invite sent to \"Desi Beats HD\"", time: "3 days ago" },
  { id: "6", type: "claim", message: "Disputed claim on \"Sada Punjab\" resolved — claim reinstated", time: "3 days ago" },
];

function getActivityIcon(type: RecentActivity["type"]) {
  switch (type) {
    case "claim": return <FileVideo className="w-4 h-4 text-orange-500" />;
    case "channel": return <Radio className="w-4 h-4 text-blue-500" />;
    case "asset": return <Package className="w-4 h-4 text-green-500" />;
    case "policy": return <Shield className="w-4 h-4 text-purple-500" />;
  }
}

export default function CmsDashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            <p className={`text-xs mt-1 ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-500"}`}>
              {stat.change}
            </p>
          </Link>
        ))}
      </div>

      {/* Main Content - Issues + Channels Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Issues Card */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-800">Issues</h2>
          </div>
          <div className="px-6">
            {/* Column header */}
            <div className="flex items-center justify-between py-2 text-xs text-gray-500 border-b border-gray-100">
              <span></span>
              <span>Action required</span>
            </div>
            {/* Issue rows */}
            {issueRows.map((issue) => (
              <Link
                key={issue.label}
                href={issue.href}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors -mx-6 px-6"
              >
                <span className="text-sm text-gray-700">{issue.label}</span>
                <span className={`text-sm font-medium min-w-[32px] text-center ${issue.count > 0 ? "text-blue-600" : "text-gray-400"}`}>
                  {issue.count}
                </span>
              </Link>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <Link
              href="/cms-issues"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all issues
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Channels Overview Card */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-800">Channels overview</h2>
          </div>
          <div className="px-6">
            {channelOverviewRows.map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors -mx-6 px-6"
              >
                <span className="text-sm text-gray-700">{row.label}</span>
                <span className={`text-sm font-medium min-w-[32px] text-center rounded-full px-2.5 py-0.5 ${
                  row.count > 0 ? "bg-blue-50 text-blue-600" : "text-gray-400"
                }`}>
                  {row.count}
                </span>
              </Link>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <Link
              href="/cms-channels"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all channels
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-800">Recent activity</h2>
          <Link
            href="/cms-reports"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View reports
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

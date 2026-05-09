"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CreditCard,
  Banknote,
} from "lucide-react";
import RevenueChart from "@/components/charts/RevenueChart";
import StatsCard from "@/components/dashboard/StatsCard";
import { revenueData, topVideos } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function RevenuePage() {
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAdRevenue = revenueData.reduce((sum, d) => sum + d.adRevenue, 0);
  const totalPremium = revenueData.reduce((sum, d) => sum + d.ytPremium, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-sm text-muted mt-1">
          Track your earnings and revenue breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change="+15.3% from last year"
          changeType="positive"
          icon={DollarSign}
          iconColor="#22c55e"
          iconBg="#dcfce7"
        />
        <StatsCard
          title="Ad Revenue"
          value={formatCurrency(totalAdRevenue)}
          change="+12.1% from last year"
          changeType="positive"
          icon={Banknote}
          iconColor="#f59e0b"
          iconBg="#fef3c7"
        />
        <StatsCard
          title="YT Premium"
          value={formatCurrency(totalPremium)}
          change="+28.5% from last year"
          changeType="positive"
          icon={CreditCard}
          iconColor="#3b82f6"
          iconBg="#dbeafe"
        />
        <StatsCard
          title="Est. RPM"
          value="$2.77"
          change="+2.1% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="#8b5cf6"
          iconBg="#ede9fe"
        />
      </div>

      <RevenueChart />

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">
          Revenue by Video
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Video
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Views
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  RPM
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {topVideos
                .sort((a, b) => b.revenue - a.revenue)
                .map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-border/50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-slate-200 rounded overflow-hidden shrink-0">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[300px]">
                          {video.title}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-foreground">
                      {formatNumber(video.views)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-success">
                      {formatCurrency(video.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-foreground">
                      ${((video.revenue / video.views) * 1000).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center text-xs text-success">
                        <ArrowUpRight className="w-3 h-3" />
                        +{(Math.random() * 20 + 5).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {revenueData.map((item) => (
              <div key={item.date} className="flex items-center gap-4">
                <span className="text-sm text-muted w-8">{item.date}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary rounded-full h-3 transition-all"
                    style={{
                      width: `${(item.revenue / 4000) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-16 text-right">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue Split</h3>
          <div className="space-y-6 pt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Ad Revenue</span>
                <span className="text-sm font-semibold text-foreground">
                  {((totalAdRevenue / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-amber-500 rounded-full h-3"
                  style={{
                    width: `${(totalAdRevenue / totalRevenue) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted mt-1">
                {formatCurrency(totalAdRevenue)}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">YouTube Premium</span>
                <span className="text-sm font-semibold text-foreground">
                  {((totalPremium / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-blue-500 rounded-full h-3"
                  style={{
                    width: `${(totalPremium / totalRevenue) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted mt-1">
                {formatCurrency(totalPremium)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

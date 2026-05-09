"use client";

import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/dashboard/StatsCard";
import { revenueData as mockRevenueData } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";

interface AnalyticsResponse {
  columnHeaders?: Array<{ name?: string | null }>;
  rows?: Array<Array<string | number>>;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function transformRevenueData(data: AnalyticsResponse | null) {
  if (!data?.rows?.length || !data.columnHeaders) return null;

  const headers = data.columnHeaders.map((h) => h.name || "");
  const monthIdx = headers.indexOf("month");
  const revenueIdx = headers.indexOf("estimatedRevenue");
  const adRevenueIdx = headers.indexOf("estimatedAdRevenue");
  const grossIdx = headers.indexOf("grossRevenue");

  if (revenueIdx === -1) return null;

  return data.rows.map((row) => {
    const monthStr = String(row[monthIdx]);
    const monthNum = parseInt(monthStr.split("-")[1] || monthStr, 10);
    const monthLabel = MONTHS[monthNum - 1] || monthStr;

    const revenue = Number(row[revenueIdx]) || 0;
    const adRevenue = adRevenueIdx !== -1 ? Number(row[adRevenueIdx]) || 0 : revenue * 0.85;
    const ytPremium = grossIdx !== -1
      ? Math.max(0, (Number(row[grossIdx]) || 0) - adRevenue)
      : revenue - adRevenue;

    return {
      date: monthLabel,
      revenue: Math.round(revenue * 100) / 100,
      adRevenue: Math.round(adRevenue * 100) / 100,
      ytPremium: Math.round(ytPremium * 100) / 100,
    };
  });
}

export default function RevenuePage() {
  const { status } = useSession();
  const { data: revenueApiData, isReal, error, loading } = useYouTubeData<AnalyticsResponse | null>(
    "revenue",
    {},
    null
  );

  const realRevenue = transformRevenueData(revenueApiData);
  const revenueData = realRevenue || mockRevenueData;

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAdRevenue = revenueData.reduce((sum, d) => sum + d.adRevenue, 0);
  const totalPremium = revenueData.reduce((sum, d) => sum + d.ytPremium, 0);
  const estRPM = totalRevenue > 0 ? ((totalRevenue / (totalRevenue / 2.77))).toFixed(2) : "0.00";

  const isAuthenticated = status === "authenticated";
  const isNotMonetized = isReal && !realRevenue && !error;
  const showingReal = isReal && !!realRevenue;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
          <p className="text-sm text-muted mt-1">
            Track your earnings and revenue breakdown.
          </p>
        </div>
        {showingReal && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            <Wifi className="w-3.5 h-3.5" />
            Live Revenue Data
          </div>
        )}
        {isAuthenticated && loading && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Wifi className="w-3.5 h-3.5" />
            Loading Revenue Data...
          </div>
        )}
        {isAuthenticated && !loading && error && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <WifiOff className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
        {isNotMonetized && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Channel not monetized — showing demo data
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <WifiOff className="w-3.5 h-3.5" />
            Demo Data — Sign in for real data
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={showingReal ? "From YouTube Analytics" : "Demo data"}
          changeType="positive"
          icon={DollarSign}
          iconColor="#22c55e"
          iconBg="#dcfce7"
        />
        <StatsCard
          title="Ad Revenue"
          value={formatCurrency(totalAdRevenue)}
          change={showingReal ? "From YouTube Analytics" : "Demo data"}
          changeType="positive"
          icon={Banknote}
          iconColor="#f59e0b"
          iconBg="#fef3c7"
        />
        <StatsCard
          title="YT Premium"
          value={formatCurrency(totalPremium)}
          change={showingReal ? "From YouTube Analytics" : "Demo data"}
          changeType="positive"
          icon={CreditCard}
          iconColor="#3b82f6"
          iconBg="#dbeafe"
        />
        <StatsCard
          title="Est. RPM"
          value={`$${estRPM}`}
          change={showingReal ? "From YouTube Analytics" : "Demo data"}
          changeType="positive"
          icon={TrendingUp}
          iconColor="#8b5cf6"
          iconBg="#ede9fe"
        />
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Revenue Breakdown</h3>
          {!showingReal && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Demo Data</span>
          )}
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
              />
              <Legend />
              <Bar dataKey="adRevenue" name="Ad Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ytPremium" name="YT Premium" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {revenueData.map((item) => {
              const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);
              return (
                <div key={item.date} className="flex items-center gap-4">
                  <span className="text-sm text-muted w-8">{item.date}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary rounded-full h-3 transition-all"
                      style={{
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-16 text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue Split</h3>
          <div className="space-y-6 pt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Ad Revenue</span>
                <span className="text-sm font-semibold text-foreground">
                  {totalRevenue > 0 ? ((totalAdRevenue / totalRevenue) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-amber-500 rounded-full h-3"
                  style={{
                    width: `${totalRevenue > 0 ? (totalAdRevenue / totalRevenue) * 100 : 0}%`,
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
                  {totalRevenue > 0 ? ((totalPremium / totalRevenue) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-blue-500 rounded-full h-3"
                  style={{
                    width: `${totalRevenue > 0 ? (totalPremium / totalRevenue) * 100 : 0}%`,
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

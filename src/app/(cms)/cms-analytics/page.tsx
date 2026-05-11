"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Eye, Clock, Globe, Monitor, Smartphone, Tablet, ChevronDown } from "lucide-react";

interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

const revenueMetrics: MetricCard[] = [
  { label: "Estimated Revenue", value: "$4,520.00", change: "+8.2%", trend: "up" },
  { label: "RPM", value: "$3.45", change: "+2.1%", trend: "up" },
  { label: "CPM", value: "$5.12", change: "-1.3%", trend: "down" },
  { label: "Ad Impressions", value: "1.31M", change: "+5.6%", trend: "up" },
];

const audienceMetrics: MetricCard[] = [
  { label: "Views", value: "3.2M", change: "+12.4%", trend: "up" },
  { label: "Watch Time (hours)", value: "145K", change: "+9.8%", trend: "up" },
  { label: "Unique Viewers", value: "1.8M", change: "+7.2%", trend: "up" },
  { label: "Avg View Duration", value: "3:42", change: "+0.5%", trend: "up" },
];

const ageData = [
  { group: "13-17", percent: 8 },
  { group: "18-24", percent: 32 },
  { group: "25-34", percent: 28 },
  { group: "35-44", percent: 18 },
  { group: "45-54", percent: 9 },
  { group: "55-64", percent: 3 },
  { group: "65+", percent: 2 },
];

const geoData = [
  { country: "India", views: "1.8M", percent: 56 },
  { country: "United States", views: "320K", percent: 10 },
  { country: "Canada", views: "256K", percent: 8 },
  { country: "United Kingdom", views: "192K", percent: 6 },
  { country: "Australia", views: "128K", percent: 4 },
  { country: "Pakistan", views: "96K", percent: 3 },
  { country: "Other", views: "416K", percent: 13 },
];

const trafficSources = [
  { source: "YouTube search", views: "960K", percent: 30 },
  { source: "Suggested videos", views: "832K", percent: 26 },
  { source: "Browse features", views: "640K", percent: 20 },
  { source: "External", views: "384K", percent: 12 },
  { source: "Channel pages", views: "192K", percent: 6 },
  { source: "Other", views: "192K", percent: 6 },
];

const deviceData = [
  { device: "Mobile", icon: Smartphone, percent: 62 },
  { device: "Desktop", icon: Monitor, percent: 25 },
  { device: "Tablet", icon: Tablet, percent: 8 },
  { device: "TV", icon: Monitor, percent: 5 },
];

export default function CmsAnalyticsPage() {
  const [dateRange, setDateRange] = useState("28d");
  const [activeTab, setActiveTab] = useState<"revenue" | "audience" | "traffic" | "geography">("revenue");

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Analytics</h1>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-600">
          <option value="7d">Last 7 days</option>
          <option value="28d">Last 28 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last 365 days</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        {(["revenue", "audience", "traffic", "geography"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {revenueMetrics.map(m => (
              <div key={m.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                <p className="text-2xl font-semibold text-gray-800">{m.value}</p>
                <p className={`text-xs mt-1 ${m.trend === "up" ? "text-green-600" : "text-red-600"}`}>{m.change} vs previous period</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Revenue Over Time</h3>
            <div className="h-[250px] flex items-end gap-1">
              {Array.from({ length: 28 }, (_, i) => {
                const h = 20 + Math.random() * 80;
                return <div key={i} className="flex-1 bg-blue-400 rounded-t hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }} title={`Day ${i + 1}`} />;
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>28 days ago</span>
              <span>Today</span>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Revenue by Ad Type</h3>
            <div className="space-y-3">
              {[
                { type: "Auction ads (display)", revenue: "$2,100", percent: 46 },
                { type: "Auction ads (video)", revenue: "$1,200", percent: 27 },
                { type: "Reserved ads", revenue: "$820", percent: 18 },
                { type: "YouTube Premium", revenue: "$400", percent: 9 },
              ].map(ad => (
                <div key={ad.type} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-48">{ad.type}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${ad.percent}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-20 text-right">{ad.revenue}</span>
                  <span className="text-xs text-gray-400 w-12 text-right">{ad.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Audience Tab */}
      {activeTab === "audience" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {audienceMetrics.map(m => (
              <div key={m.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                <p className="text-2xl font-semibold text-gray-800">{m.value}</p>
                <p className={`text-xs mt-1 ${m.trend === "up" ? "text-green-600" : "text-red-600"}`}>{m.change}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Age Distribution</h3>
              <div className="space-y-2">
                {ageData.map(a => (
                  <div key={a.group} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">{a.group}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${a.percent}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right">{a.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Gender Distribution</h3>
              <div className="flex items-center justify-center gap-8 py-8">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-8 border-blue-400 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">68%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Male</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-8 border-pink-400 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">30%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Female</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-8 border-gray-300 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">2%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Other</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Traffic Tab */}
      {activeTab === "traffic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {trafficSources.map(t => (
                <div key={t.source} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-40">{t.source}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${t.percent}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">{t.views}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{t.percent}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Device Breakdown</h3>
            <div className="space-y-4">
              {deviceData.map(d => (
                <div key={d.device} className="flex items-center gap-4">
                  <d.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 w-20">{d.device}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="bg-orange-400 h-3 rounded-full" style={{ width: `${d.percent}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10 text-right">{d.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Geography Tab */}
      {activeTab === "geography" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {geoData.map((g, i) => (
              <div key={g.country} className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-6">{i + 1}</span>
                <span className="text-sm text-gray-700 w-40 font-medium">{g.country}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${g.percent}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">{g.views}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{g.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ViewsChart from "@/components/charts/ViewsChart";
import SubscriberChart from "@/components/charts/SubscriberChart";
import {
  trafficSources,
  demographicsData,
  countryData,
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Globe, Users, MonitorPlay, Smartphone } from "lucide-react";

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted mt-1">
          Detailed analytics and insights for your channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsChart />
        <SubscriberChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Traffic Sources</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="percentage"
                  nameKey="source"
                  label={(props) => `${props.name ?? ""}: ${props.value}%`}
                  labelLine={true}
                >
                  {trafficSources.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Share"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Audience Demographics
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="age"
                  type="category"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  width={50}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, undefined]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend />
                <Bar dataKey="male" name="Male" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="female" name="Female" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-muted" />
          <h3 className="font-semibold text-foreground">
            Top Countries by Views
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Country
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Views
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Share
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody>
              {countryData.map((item) => (
                <tr
                  key={item.country}
                  className="border-b border-border/50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {item.country}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    {formatNumber(item.views)}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    {item.percentage}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MonitorPlay className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Desktop</p>
              <p className="text-lg font-bold text-foreground">45%</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-500 rounded-full h-1.5" style={{ width: "45%" }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Mobile</p>
              <p className="text-lg font-bold text-foreground">42%</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-green-500 rounded-full h-1.5" style={{ width: "42%" }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MonitorPlay className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Tablet</p>
              <p className="text-lg font-bold text-foreground">8%</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-purple-500 rounded-full h-1.5" style={{ width: "8%" }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <MonitorPlay className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Smart TV</p>
              <p className="text-lg font-bold text-foreground">5%</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-amber-500 rounded-full h-1.5" style={{ width: "5%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

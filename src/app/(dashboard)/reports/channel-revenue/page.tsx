"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatNumber } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";

interface YouTubeChannel {
  id?: string | null;
  snippet?: {
    title?: string | null;
    thumbnails?: {
      default?: { url?: string | null } | null;
      medium?: { url?: string | null } | null;
    } | null;
  } | null;
  statistics?: {
    subscriberCount?: string | null;
    videoCount?: string | null;
    viewCount?: string | null;
  } | null;
}

export default function ChannelRevenuePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.accessToken;

  const { data: channels, isReal, loading } = useYouTubeData<YouTubeChannel[]>("channels", {}, []);
  const [dateRange, setDateRange] = useState("28d");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Reports</span>
        <span>›</span>
        <span className="text-foreground font-medium">Channel Revenue</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Channel Revenue</h1>
          <p className="text-sm text-muted mt-1">Revenue breakdown by channel.</p>
        </div>
        <div className="flex items-center gap-3">
          {isReal && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              <Wifi className="w-3.5 h-3.5" />
              Live Data
            </div>
          )}
          {!isAuthenticated && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff className="w-3.5 h-3.5" />
              Demo Data
            </div>
          )}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="28d">Last 28 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last 365 days</option>
          </select>
          <button className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium px-3 py-2 border border-border rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted">Loading...</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Channel</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Subscribers</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Videos</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Views</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Est. Revenue</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">RPM</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr key={ch.id} className="border-b border-border hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        {(ch.snippet?.thumbnails?.default?.url || ch.snippet?.thumbnails?.medium?.url) && (
                          <img
                            src={ch.snippet?.thumbnails?.default?.url || ch.snippet?.thumbnails?.medium?.url || ""}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{ch.snippet?.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(Number(ch.statistics?.subscriberCount || 0))}</td>
                  <td className="px-4 py-3 text-foreground">{Number(ch.statistics?.videoCount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(Number(ch.statistics?.viewCount || 0))}</td>
                  <td className="px-4 py-3 text-foreground font-medium">--</td>
                  <td className="px-4 py-3 text-foreground">--</td>
                </tr>
              ))}
              {channels.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    No channels found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

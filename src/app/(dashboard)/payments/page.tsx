"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCard,
  Loader2,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";

const CHANNELS_STORAGE_KEY = "bainsla_channels";

interface StoredChannel {
  id: string;
  status: "active" | "delinked" | "transferred";
}

interface NetworkAssignment {
  networkId: string;
  networkName: string;
  revenueSharePercent: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  networks?: NetworkAssignment[];
}

interface ChannelRevenueInfo {
  revenue: number;
  views: number;
  rpm: number;
}

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

interface DashboardData {
  channels?: YouTubeChannel[];
  channelRevenueMap?: Record<string, ChannelRevenueInfo>;
}

function getActiveChannelIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CHANNELS_STORAGE_KEY);
    if (!stored) return [];
    const channels: StoredChannel[] = JSON.parse(stored);
    return channels.filter((c) => c.status === "active").map((c) => c.id);
  } catch {
    return [];
  }
}

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const startDate = d.toISOString().split("T")[0];
    const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const endDate = endD.toISOString().split("T")[0];
    options.push({ label, startDate, endDate });
  }
  return options;
}

export default function PaymentsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated" && (!!session?.accessToken || session?.user?.role === "admin");

  const [activeChannelIds, setActiveChannelIds] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tdsPercent, setTdsPercent] = useState(0);

  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const currentMonth = monthOptions[selectedMonth];

  // Custom date range
  const [useCustom, setUseCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(currentMonth?.startDate || "");
  const [customTo, setCustomTo] = useState(currentMonth?.endDate || "");

  const fromDate = useCustom ? customFrom : currentMonth?.startDate || "";
  const toDate = useCustom ? customTo : currentMonth?.endDate || "";

  useEffect(() => {
    setActiveChannelIds(getActiveChannelIds());
  }, []);

  // Fetch user info for network assignments
  const fetchUserInfo = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        const users: UserInfo[] = json.data || [];
        const me = users.find((u) => u.email.toLowerCase() === session.user!.email!.toLowerCase());
        if (me) setUserInfo(me);
      }
    } catch {
      // silent
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (sessionStatus === "authenticated") fetchUserInfo();
  }, [sessionStatus, fetchUserInfo]);

  const apiParams = useMemo(() => ({
    startDate: fromDate,
    endDate: toDate,
    prevStartDate: fromDate,
    prevEndDate: toDate,
    ...(activeChannelIds.length > 0 ? { channelIds: activeChannelIds.join(",") } : {}),
  }), [fromDate, toDate, activeChannelIds]);

  const { data: dashData, isReal, loading } = useYouTubeData<DashboardData>("dashboardFull", apiParams, {});

  const channels = dashData?.channels || [];
  const channelRevenueMap = dashData?.channelRevenueMap || {};

  // Get primary network assignment
  const primaryNetwork = userInfo?.networks?.[0];
  const revenueSharePercent = primaryNetwork?.revenueSharePercent || 0;

  // Per-channel revenue breakdown
  const channelBreakdown = channels.map((ch) => {
    const revInfo = channelRevenueMap[ch.id || ""];
    const revenue = revInfo?.revenue || 0;
    const share = revenue * (revenueSharePercent / 100);
    return {
      id: ch.id || "",
      name: ch.snippet?.title || "Unknown",
      thumbnail: ch.snippet?.thumbnails?.default?.url || ch.snippet?.thumbnails?.medium?.url || "",
      subscribers: Number(ch.statistics?.subscriberCount || 0),
      views: revInfo?.views || 0,
      rpm: revInfo?.rpm || 0,
      revenue,
      networkShare: share,
      afterShare: revenue - share,
    };
  });

  const totalRevenue = channelBreakdown.reduce((s, c) => s + c.revenue, 0);
  const totalNetworkShare = totalRevenue * (revenueSharePercent / 100);
  const afterNetworkShare = totalRevenue - totalNetworkShare;
  const tdsAmount = afterNetworkShare * (tdsPercent / 100);
  const netPayable = afterNetworkShare - tdsAmount;

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted mt-1">View your monthly revenue breakdown and payment details.</p>
      </div>

      {/* Month Selection */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Select Period
            </label>
            <div className="flex items-center gap-3">
              <select
                value={useCustom ? "custom" : String(selectedMonth)}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setUseCustom(true);
                  } else {
                    setUseCustom(false);
                    setSelectedMonth(Number(e.target.value));
                  }
                }}
                className="border border-border rounded-lg px-3 py-2 text-sm min-w-[200px]"
              >
                {monthOptions.map((m, i) => (
                  <option key={i} value={String(i)}>{m.label}</option>
                ))}
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {useCustom && (
            <>
              <div>
                <label className="block text-xs text-muted mb-1">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-muted mb-1">TDS %</label>
            <input
              type="number"
              value={tdsPercent}
              onChange={(e) => setTdsPercent(Number(e.target.value) || 0)}
              min={0}
              max={100}
              className="border border-border rounded-lg px-3 py-2 text-sm w-20"
            />
          </div>

          <div className="text-sm text-muted">
            {fromDate} <ArrowRight className="w-3 h-3 inline" /> {toDate}
          </div>
        </div>

        {primaryNetwork && (
          <div className="mt-3 text-sm text-muted">
            Network: <span className="font-medium text-foreground">{primaryNetwork.networkName}</span> &middot; Revenue Share: <span className="font-medium text-foreground">{primaryNetwork.revenueSharePercent}%</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted">Loading revenue data...</span>
        </div>
      )}

      {/* Per-Channel Revenue Breakdown */}
      {isReal && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-slate-50">
            <h2 className="text-sm font-semibold text-foreground">Per-Channel Revenue Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">Channel</th>
                  <th className="text-right px-4 py-3 font-semibold">Views</th>
                  <th className="text-right px-4 py-3 font-semibold">RPM</th>
                  <th className="text-right px-4 py-3 font-semibold">Revenue</th>
                  <th className="text-right px-4 py-3 font-semibold">Network Share ({revenueSharePercent}%)</th>
                  <th className="text-right px-4 py-3 font-semibold">After Share</th>
                </tr>
              </thead>
              <tbody>
                {channelBreakdown.map((ch) => (
                  <tr key={ch.id} className="border-b border-border hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ch.thumbnail && (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            <img src={ch.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{ch.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{formatNumber(ch.views)}</td>
                    <td className="px-4 py-3 text-right text-foreground">${ch.rpm.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(ch.revenue)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{formatCurrency(ch.networkShare)}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(ch.afterShare)}</td>
                  </tr>
                ))}
                {channelBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted">
                      No channel revenue data for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {isReal && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Total Revenue (all channels)</span>
              <span className="font-medium text-foreground text-lg">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Network Revenue Share ({revenueSharePercent}%)</span>
              <span className="text-red-500">- {formatCurrency(totalNetworkShare)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center text-sm">
              <span className="text-muted">After Network Share</span>
              <span className="font-medium">{formatCurrency(afterNetworkShare)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">TDS ({tdsPercent}%)</span>
              <span className="text-red-500">- {formatCurrency(tdsAmount)}</span>
            </div>
            <div className="border-t-2 border-border pt-3 flex justify-between items-center">
              <span className="font-bold text-foreground text-lg">Net Payable</span>
              <span className="font-bold text-green-600 text-2xl">{formatCurrency(netPayable)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

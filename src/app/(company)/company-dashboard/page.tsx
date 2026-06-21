"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Radio,
  DollarSign,
  Eye,
  TrendingUp,
  Loader2,
  Search,
  ChevronRight,
  ExternalLink,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useExchangeRate } from "@/lib/hooks/useExchangeRate";
import BrandingSettings from "@/components/features/BrandingSettings";
import NetworkSettings from "@/components/features/NetworkSettings";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  channels: string[];
  pendingChannels?: string[];
  status: "active" | "inactive" | "pending";
  joinedDate: string;
  category: string;
  parentId?: string;
}

interface CachedChannelData {
  channelId: string;
  channelTitle: string;
  thumbnail: string;
  subscribers: number;
  views: number;
  videoCount: number;
  estimatedRevenue: number;
  rpm: number;
}

interface CachedClientData {
  userId: string;
  email: string;
  channels: CachedChannelData[];
  totalRevenue: number;
  totalViews: number;
  totalSubscribers: number;
  lastUpdated: string;
}

interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  requestDate: string;
  processedDate: string;
  adminNote: string;
}

export default function CompanyDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { rate: INR_RATE } = useExchangeRate("USD");

  const [clients, setClients] = useState<ClientUser[]>([]);
  const [cachedData, setCachedData] = useState<CachedClientData[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [meData, setMeData] = useState<{ id: string; branding?: { brandName?: string; brandColor?: string; brandLogo?: string }; whiteLabelEnabled?: boolean; revenueSharePercent?: number; customNetworks?: string[] } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "company") {
      router.push("/login");
    }
  }, [session, status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, cachedRes, withdrawRes, meRes] = await Promise.all([
        fetch("/api/users?action=myClients"),
        fetch("/api/client-data?action=getAllCachedData"),
        fetch("/api/payments?type=withdrawals"),
        fetch("/api/users?action=me"),
      ]);
      if (clientsRes.ok) {
        const j = await clientsRes.json();
        setClients(j.data || []);
      }
      if (cachedRes.ok) {
        const j = await cachedRes.json();
        setCachedData(j.data || []);
      }
      if (withdrawRes.ok) {
        const j = await withdrawRes.json();
        setWithdrawals(j.data || []);
      }
      if (meRes.ok) {
        const j = await meRes.json();
        if (j.data) setMeData(j.data);
      }
    } catch (err) {
      console.error("Failed to fetch company data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "company") fetchData();
  }, [session, fetchData]);

  // Build client data map from cached data
  const clientDataMap = new Map<string, CachedClientData>();
  for (const cd of cachedData) {
    // Match by email
    const client = clients.find((c) => c.email.toLowerCase() === cd.email?.toLowerCase());
    if (client) {
      clientDataMap.set(client.id, cd);
    }
  }

  // Aggregate totals across all clients
  const totalClients = clients.length;
  const totalChannels = clients.reduce((sum, c) => sum + (c.channels?.length || 0), 0);
  let totalRevenue = 0;
  let totalViews = 0;
  let totalSubscribers = 0;
  for (const cd of clientDataMap.values()) {
    totalRevenue += cd.totalRevenue || 0;
    totalViews += cd.totalViews || 0;
    totalSubscribers += cd.totalSubscribers || 0;
  }

  const activeClients = clients.filter((c) => c.status === "active").length;

  // Filter clients by search
  const filteredClients = clients.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  if (status === "loading" || (session?.user?.role !== "company" && status !== "unauthenticated")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Overview of all your clients and their channel performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Clients</p>
              <p className="text-xl font-bold text-foreground">{totalClients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Active Clients</p>
              <p className="text-xl font-bold text-green-600">{activeClients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Radio className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Channels</p>
              <p className="text-xl font-bold text-foreground">{totalChannels}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Revenue</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Views</p>
              <p className="text-xl font-bold text-foreground">{formatNumber(totalViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Your Clients</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => router.push("/company-clients")}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              Manage Clients
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No clients yet. Add your first client from the Manage Clients page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Email</th>
                  <th className="text-center py-3 px-4 font-medium text-muted">Channels</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Revenue ($)</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Revenue (INR)</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Views</th>
                  <th className="text-center py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const cd = clientDataMap.get(client.id);
                  const rev = cd?.totalRevenue || 0;
                  const views = cd?.totalViews || 0;
                  return (
                    <tr key={client.id} className="border-b border-border/50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted">{client.email}</td>
                      <td className="py-3 px-4 text-center font-medium">{client.channels?.length || 0}</td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">{formatCurrency(rev)}</td>
                      <td className="py-3 px-4 text-right font-medium text-amber-600">
                        {INR_RATE > 0 ? `₹${(rev * INR_RATE).toFixed(0)}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">{formatNumber(views)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          client.status === "active" ? "bg-green-100 text-green-700" :
                          client.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => router.push(`/company-clients?view=${client.id}`)}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary-dark text-xs font-medium"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td className="py-3 px-4">Total ({filteredClients.length} clients)</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-center">{totalChannels}</td>
                  <td className="py-3 px-4 text-right text-green-600">{formatCurrency(totalRevenue)}</td>
                  <td className="py-3 px-4 text-right text-amber-600">
                    {INR_RATE > 0 ? `₹${(totalRevenue * INR_RATE).toFixed(0)}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">{formatNumber(totalViews)}</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Requests */}
      {withdrawals.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-amber-600" />
              Client Withdrawal Requests
            </h2>
            <span className="text-xs text-muted">{withdrawals.filter((w) => w.status === "pending").length} pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted">Client</th>
                  <th className="text-left py-2 px-3 font-medium text-muted">Email</th>
                  <th className="text-right py-2 px-3 font-medium text-muted">Amount</th>
                  <th className="text-center py-2 px-3 font-medium text-muted">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.slice(0, 10).map((w) => (
                  <tr key={w.id} className="border-b border-border/30">
                    <td className="py-2 px-3 font-medium">{w.userName}</td>
                    <td className="py-2 px-3 text-muted">{w.userEmail}</td>
                    <td className="py-2 px-3 text-right font-medium text-green-600">${w.amount.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        w.status === "pending" ? "bg-amber-100 text-amber-700" :
                        w.status === "paid" ? "bg-green-100 text-green-700" :
                        w.status === "approved" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {w.status === "pending" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {w.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-muted text-xs">{new Date(w.requestDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-Client Channel Breakdown */}
      {filteredClients.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Client Channel Details</h2>
          <div className="space-y-4">
            {filteredClients.map((client) => {
              const cd = clientDataMap.get(client.id);
              const channels = cd?.channels || [];
              if (channels.length === 0) return null;
              return (
                <div key={client.id} className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{client.name}</span>
                      <span className="text-xs text-muted">({channels.length} channels)</span>
                    </div>
                    <a
                      href={`/company-clients?view=${client.id}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Full Details <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2 px-3 font-medium text-muted">Channel</th>
                          <th className="text-right py-2 px-3 font-medium text-muted">Subscribers</th>
                          <th className="text-right py-2 px-3 font-medium text-muted">Views</th>
                          <th className="text-right py-2 px-3 font-medium text-muted">Revenue ($)</th>
                          <th className="text-right py-2 px-3 font-medium text-muted">RPM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channels.map((ch) => (
                          <tr key={ch.channelId} className="border-b border-border/30">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {ch.thumbnail && (
                                  <img src={ch.thumbnail} alt="" className="w-5 h-5 rounded-full" />
                                )}
                                <span className="font-medium">{ch.channelTitle || ch.channelId}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right">{formatNumber(ch.subscribers)}</td>
                            <td className="py-2 px-3 text-right">{formatNumber(ch.views)}</td>
                            <td className="py-2 px-3 text-right text-green-600">{formatCurrency(ch.estimatedRevenue)}</td>
                            <td className="py-2 px-3 text-right">${ch.rpm?.toFixed(2) || "0.00"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {meData && (
        <NetworkSettings
          userId={meData.id}
          currentNetworkName={meData.customNetworks?.[0] || ""}
          currentRevenueShare={meData.revenueSharePercent || 0}
          role="company"
          onSave={() => fetchData()}
        />
      )}

      {meData?.whiteLabelEnabled && (
        <BrandingSettings
          userId={meData.id}
          currentBranding={meData.branding}
          onSave={() => fetchData()}
        />
      )}
    </div>
  );
}

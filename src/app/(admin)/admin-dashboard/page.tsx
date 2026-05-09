"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Radio,
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown,
  Shield,
  UserPlus,
  Activity,
  Search,
  Filter,
  Loader2,
  Crown,
  BarChart3,
  Video,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  channels: string[];
  status: "active" | "inactive";
  joinedDate: string;
  category: string;
}

interface ChannelInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  customUrl: string;
  clientName: string;
  clientEmail: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"channels" | "name" | "status">("channels");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        setClients(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchClients();
    }
  }, [status, session, fetchClients]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === "active").length;
    const inactiveClients = clients.filter((c) => c.status === "inactive").length;
    const totalChannels = clients.reduce((sum, c) => sum + c.channels.length, 0);
    const avgChannelsPerClient = totalClients > 0 ? totalChannels / totalClients : 0;
    const clientsWithChannels = clients.filter((c) => c.channels.length > 0).length;
    const clientsWithoutChannels = clients.filter((c) => c.channels.length === 0).length;
    const categories = clients.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalClients,
      activeClients,
      inactiveClients,
      totalChannels,
      avgChannelsPerClient,
      clientsWithChannels,
      clientsWithoutChannels,
      categories,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    let result = clients;

    if (clientFilter === "active") {
      result = result.filter((c) => c.status === "active");
    } else if (clientFilter === "inactive") {
      result = result.filter((c) => c.status === "inactive");
    } else if (clientFilter === "with-channels") {
      result = result.filter((c) => c.channels.length > 0);
    } else if (clientFilter === "without-channels") {
      result = result.filter((c) => c.channels.length === 0);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.channels.some((ch) => ch.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "channels") cmp = a.channels.length - b.channels.length;
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [clients, clientFilter, searchQuery, sortBy, sortDir]);

  const topClientsByChannels = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.channels.length - a.channels.length)
      .slice(0, 5);
  }, [clients]);

  const categoryBreakdown = useMemo(() => {
    return Object.entries(stats.categories)
      .sort(([, a], [, b]) => b - a);
  }, [stats.categories]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin Panel</span>
        <span>›</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of all clients, channels, and system metrics.</p>
        </div>
        <button
          onClick={fetchClients}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Avg Channels/User</p>
              <p className="text-2xl font-bold text-foreground">{stats.avgChannelsPerClient.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Inactive Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.inactiveClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Users with Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.clientsWithChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Users without Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.clientsWithoutChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Filter className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Categories</p>
              <p className="text-2xl font-bold text-foreground">{Object.keys(stats.categories).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients by Channels */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Top Clients</h2>
            </div>
            <span className="text-xs text-muted">By channel count</span>
          </div>
          <div className="p-4">
            {topClientsByChannels.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">No clients yet</p>
            ) : (
              <div className="space-y-3">
                {topClientsByChannels.map((client, idx) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-amber-700" : "bg-slate-300"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-xs text-muted truncate">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{client.channels.length}</p>
                      <p className="text-xs text-muted">channels</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      client.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-foreground">Category Breakdown</h2>
            </div>
            <span className="text-xs text-muted">Client distribution</span>
          </div>
          <div className="p-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">No data</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(([category, count]) => {
                  const pct = stats.totalClients > 0 ? (count / stats.totalClients) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{category}</span>
                        <span className="text-muted">{count} clients ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Clients with Channels — Filterable Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Clients & Channels</h2>
          <button
            onClick={() => router.push("/admin-clients")}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Manage Users →
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border bg-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or channel ID..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Clients</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="with-channels">With Channels</option>
              <option value="without-channels">Without Channels</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">#</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Client
                    {sortBy === "name" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort("channels")}
                >
                  <div className="flex items-center gap-1">
                    Channels
                    {sortBy === "channels" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === "status" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, idx) => (
                <>
                  <tr key={client.id} className="border-b border-border hover:bg-slate-50">
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {client.name[0]}
                        </div>
                        <span className="font-medium text-foreground">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{client.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {client.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Radio className="w-3.5 h-3.5 text-purple-500" />
                        {client.channels.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        client.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {client.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{client.joinedDate}</td>
                    <td className="px-4 py-3">
                      {client.channels.length > 0 && (
                        <button
                          onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          {expandedClient === client.id ? "Hide" : "View"} Channels
                          {expandedClient === client.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedClient === client.id && client.channels.length > 0 && (
                    <tr key={`${client.id}-channels`} className="bg-slate-50">
                      <td colSpan={8} className="px-8 py-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Channel IDs assigned to {client.name}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {client.channels.map((chId) => (
                              <div
                                key={chId}
                                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-border"
                              >
                                <Radio className="w-4 h-4 text-purple-500 shrink-0" />
                                <span className="text-sm font-mono text-foreground truncate">{chId}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No clients found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-slate-50 text-sm text-muted">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/admin-clients")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">Create New User</h3>
          </div>
          <p className="text-sm text-muted">Register a new client with email, password, and channel assignments.</p>
        </button>

        <button
          onClick={() => router.push("/admin-channels")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-foreground">Manage Channels</h3>
          </div>
          <p className="text-sm text-muted">View and manage all YouTube channels across clients.</p>
        </button>

        <button
          onClick={() => router.push("/admin-reports")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-foreground">View Reports</h3>
          </div>
          <p className="text-sm text-muted">Revenue reports and analytics across all clients.</p>
        </button>
      </div>
    </div>
  );
}

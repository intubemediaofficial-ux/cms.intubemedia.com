"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Shield,
  Radio,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  channels: string[];
  status: "active" | "inactive";
  joinedDate: string;
  category: string;
}

interface YouTubeChannel {
  id?: string | null;
  snippet?: {
    title?: string | null;
    customUrl?: string | null;
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

const CLIENTS_KEY = "bainsla_admin_clients";
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

type ChannelRow = {
  channelId: string;
  name: string;
  thumbnail: string;
  subscribers: number;
  videos: number;
  views: number;
  clientName: string;
  category: string;
  tokenStatus?: string;
};

export default function AdminChannelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated" && (!!session?.accessToken || session?.user?.role === "admin");

  const [clients, setClients] = useState<Client[]>([]);
  const [channelDataMap, setChannelDataMap] = useState<Record<string, YouTubeChannel>>({});
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFilter, setClientFilter] = useState("");
  const [tokenStatuses, setTokenStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    // Fetch clients from API (KV) for admin, fallback to localStorage
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.length) {
            setClients(json.data);
            return;
          }
        }
      } catch { /* fallback below */ }
      setClients(getClients());
    };
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchClients();
    } else {
      setClients(getClients());
    }
  }, [status, session]);

  // Fetch token statuses for all channels
  useEffect(() => {
    const allIds = clients.flatMap((c) => c.channels);
    if (allIds.length === 0 || !isAuthenticated) return;
    const fetchStatuses = async () => {
      try {
        const res = await fetch(`/api/channel-tokens?action=bulkTokenStatus&channelIds=${allIds.join(",")}`);
        if (res.ok) {
          const json = await res.json();
          const statuses: Record<string, string> = {};
          for (const [id, val] of Object.entries(json.data?.statuses || {})) {
            statuses[id] = (val as { status: string }).status;
          }
          setTokenStatuses(statuses);
        }
      } catch { /* silent */ }
    };
    fetchStatuses();
  }, [clients, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const allIds = clients.flatMap((c) => c.channels).filter((id) => !channelDataMap[id]);
    if (allIds.length === 0) return;

    setLoadingChannels(true);
    const allChannelIds = clients.flatMap((c) => c.channels);
    const fetchAll = async () => {
      for (const id of allIds) {
        try {
          const res = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(id)}&allChannelIds=${allChannelIds.join(",")}`);
          const json = await res.json();
          if (res.ok && json.data?.length) {
            setChannelDataMap((prev) => ({ ...prev, [id]: json.data[0] }));
          }
        } catch {
          // skip
        }
      }
      setLoadingChannels(false);
    };
    fetchAll();
  }, [isAuthenticated, clients, channelDataMap]);

  const allChannelRows: ChannelRow[] = useMemo(() => {
    const rows: ChannelRow[] = [];
    for (const client of clients) {
      for (const chId of client.channels) {
        const data = channelDataMap[chId];
        rows.push({
          channelId: chId,
          name: data?.snippet?.title || chId,
          thumbnail: data?.snippet?.thumbnails?.medium?.url || data?.snippet?.thumbnails?.default?.url || "",
          subscribers: Number(data?.statistics?.subscriberCount || 0),
          videos: Number(data?.statistics?.videoCount || 0),
          views: Number(data?.statistics?.viewCount || 0),
          clientName: client.name,
          category: client.category,
          tokenStatus: tokenStatuses[chId] || "none",
        });
      }
    }
    return rows;
  }, [clients, channelDataMap, tokenStatuses]);

  const filteredChannels = useMemo(() => {
    let result = allChannelRows;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.channelId.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q)
      );
    }

    if (clientFilter) {
      result = result.filter((c) => c.clientName === clientFilter);
    }

    return result;
  }, [allChannelRows, searchQuery, clientFilter]);

  const totalPages = Math.ceil(filteredChannels.length / perPage);
  const pageChannels = filteredChannels.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin</span>
        <span>›</span>
        <span className="text-foreground font-medium">All Channels</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">All Channels</h1>
        <p className="text-sm text-muted mt-1">View all YouTube channels across all clients.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Total Channels</p>
            <p className="text-2xl font-bold text-purple-900">{allChannelRows.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by channel name, ID, or client..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={clientFilter}
            onChange={(e) => { setClientFilter(e.target.value); setCurrentPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button
            onClick={() => { setSearchQuery(""); setClientFilter(""); setCurrentPage(1); }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground px-3 py-2 border border-border rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {loadingChannels && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted">Loading channel data...</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Channel</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Subscribers</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Videos</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Views</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Token</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageChannels.map((channel) => (
                <tr key={`${channel.clientName}-${channel.channelId}`} className="border-b border-border hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        {channel.thumbnail ? (
                          <img
                            src={channel.thumbnail}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                            {channel.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{channel.name}</span>
                        <p className="text-xs text-muted">{channel.channelId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(channel.subscribers)}</td>
                  <td className="px-4 py-3 text-foreground">{channel.videos.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(channel.views)}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-primary">{channel.clientName}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{channel.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      channel.tokenStatus === "valid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {channel.tokenStatus === "valid" ? "Valid" : "Not Validated"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://www.youtube.com/channel/${channel.channelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                      title="View on YouTube"
                    >
                      <ExternalLink className="w-4 h-4 text-red-500" />
                    </a>
                  </td>
                </tr>
              ))}
              {pageChannels.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    {loadingChannels
                      ? "Loading..."
                      : "No channels found. Add clients with channel IDs first."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50">
            <p className="text-sm text-muted">
              Showing {(currentPage - 1) * perPage + 1} to{" "}
              {Math.min(currentPage * perPage, filteredChannels.length)} of {filteredChannels.length}
            </p>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

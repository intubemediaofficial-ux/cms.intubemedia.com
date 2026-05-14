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
  DollarSign,
  Eye,
  MoreVertical,
  Trash2,
  Edit3,
  ArrowRightLeft,
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
  revenue: number;
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
  const [channelRevenueMap, setChannelRevenueMap] = useState<Record<string, number>>({});
  const [channelClientMap, setChannelClientMap] = useState<Record<string, string>>({}); // channelId → client name
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFilter, setClientFilter] = useState("");
  const [tokenStatuses, setTokenStatuses] = useState<Record<string, string>>({});
  const [selectedChannel, setSelectedChannel] = useState<ChannelRow | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Fetch token statuses for all channels (KV + cached)
  useEffect(() => {
    if (!isAuthenticated) return;
    const kvIds = clients.flatMap((c) => c.channels);
    const cachedIds = Object.keys(channelDataMap);
    const allIdsSet = new Set([...kvIds, ...cachedIds].filter((id) => !id.startsWith("UCtest") && id !== "test"));
    const allIds = Array.from(allIdsSet);
    if (allIds.length === 0) return;
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
  }, [clients, channelDataMap, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoadingChannels(true);
    const fetchAll = async () => {
      const newMap: Record<string, YouTubeChannel> = {};
      const revMap: Record<string, number> = {};
      const clientMap: Record<string, string> = {};

      // First try to get cached data for all channels (includes channels synced from client)
      try {
        const cachedRes = await fetch("/api/client-data?action=getAllCachedData");
        if (cachedRes.ok) {
          const cachedJson = await cachedRes.json();
          const cachedData = cachedJson.data || [];
          for (const cd of cachedData) {
            // Map channels to client name using cached data email → client name
            const clientEmail = (cd.email || "").toLowerCase();
            const matchedClient = clients.find((c) => c.email.toLowerCase() === clientEmail);
            const clientName = matchedClient?.name || cd.email || "Unknown";
            
            for (const ch of (cd.channels || [])) {
              newMap[ch.channelId] = {
                id: ch.channelId,
                snippet: {
                  title: ch.channelTitle,
                  thumbnails: { default: { url: ch.thumbnail }, medium: { url: ch.thumbnail } },
                },
                statistics: {
                  subscriberCount: String(ch.subscribers || 0),
                  videoCount: String(ch.videoCount || 0),
                  viewCount: String(ch.views || 0),
                },
              };
              revMap[ch.channelId] = ch.estimatedRevenue || 0;
              clientMap[ch.channelId] = clientName;
            }
          }
        }
      } catch { /* silent */ }
      
      const allIds = clients.flatMap((c) => c.channels);

      // Then try YouTube API for channels not in cache
      const remainingIds = allIds.filter((id) => !newMap[id]);
      for (const id of remainingIds) {
        try {
          const res = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(id)}&allChannelIds=${allIds.join(",")}`);
          const json = await res.json();
          if (res.ok && json.data?.length) {
            newMap[id] = json.data[0];
          }
        } catch {
          // skip
        }
      }

      setChannelDataMap((prev) => ({ ...prev, ...newMap }));
      setChannelRevenueMap((prev) => ({ ...prev, ...revMap }));
      setChannelClientMap((prev) => ({ ...prev, ...clientMap }));
      setLoadingChannels(false);
    };
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, clients]);

  const allChannelRows: ChannelRow[] = useMemo(() => {
    const rows: ChannelRow[] = [];
    const seenIds = new Set<string>();
    for (const client of clients) {
      for (const chId of client.channels) {
        // Skip test/placeholder channel IDs if we have real cached data
        if ((chId.startsWith("UCtest") || chId === "test") && Object.keys(channelDataMap).some((k) => !k.startsWith("UCtest") && k !== "test")) {
          continue;
        }
        seenIds.add(chId);
        const data = channelDataMap[chId];
        rows.push({
          channelId: chId,
          name: data?.snippet?.title || chId,
          thumbnail: data?.snippet?.thumbnails?.medium?.url || data?.snippet?.thumbnails?.default?.url || "",
          subscribers: Number(data?.statistics?.subscriberCount || 0),
          videos: Number(data?.statistics?.videoCount || 0),
          views: Number(data?.statistics?.viewCount || 0),
          revenue: channelRevenueMap[chId] || 0,
          clientName: client.name,
          category: client.category,
          tokenStatus: tokenStatuses[chId] || "none",
        });
      }
    }
    // Also include cached channels that aren't yet in any client's KV channel list
    for (const [chId, data] of Object.entries(channelDataMap)) {
      if (seenIds.has(chId)) continue;
      if (chId.startsWith("UCtest") || chId === "test") continue;
      // Find client name from channelClientMap (mapped from cached data email)
      const cachedClientName = channelClientMap[chId] || "";
      // Try to match to a known client
      const matchedClient = clients.find((c) => c.name === cachedClientName);
      rows.push({
        channelId: chId,
        name: data?.snippet?.title || chId,
        thumbnail: data?.snippet?.thumbnails?.medium?.url || data?.snippet?.thumbnails?.default?.url || "",
        subscribers: Number(data?.statistics?.subscriberCount || 0),
        videos: Number(data?.statistics?.videoCount || 0),
        views: Number(data?.statistics?.viewCount || 0),
        revenue: channelRevenueMap[chId] || 0,
        clientName: cachedClientName || "Unknown",
        category: matchedClient?.category || "-",
        tokenStatus: tokenStatuses[chId] || "none",
      });
    }
    return rows;
  }, [clients, channelDataMap, channelRevenueMap, channelClientMap, tokenStatuses]);

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

  const handleDeleteChannel = async (channelId: string, clientName: string) => {
    setActionLoading(true);
    try {
      let owner = clients.find((c) => c.channels.includes(channelId));
      if (!owner) {
        owner = clients.find((c) => c.name === clientName || c.email === clientName);
      }
      if (!owner) {
        // Channel is only in cached data, not in any client's KV list — remove from cache directly
        setChannelDataMap((prev) => {
          const next = { ...prev };
          delete next[channelId];
          return next;
        });
        setDeleteConfirm(null);
        setActiveActionMenu(null);
        setMenuPosition(null);
        setActionLoading(false);
        return;
      }
      const updatedChannels = owner.channels.filter((ch) => ch !== channelId);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: owner.id, channels: updatedChannels }),
      });
      if (res.ok) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === owner.id ? { ...c, channels: updatedChannels } : c
          )
        );
        setChannelDataMap((prev) => {
          const next = { ...prev };
          delete next[channelId];
          return next;
        });
        setDeleteConfirm(null);
        setActiveActionMenu(null);
        setMenuPosition(null);
      } else {
        alert("Failed to delete channel. Please try again.");
      }
    } catch {
      alert("Error deleting channel.");
    }
    setActionLoading(false);
  };

  const handleTransferChannel = async (channelId: string, fromClientName: string) => {
    const otherClients = clients.filter((c) => c.name !== fromClientName);
    if (otherClients.length === 0) {
      alert("No other clients to transfer to.");
      return;
    }
    const targetName = prompt(
      `Transfer channel to which client?\n\nAvailable:\n${otherClients.map((c) => `- ${c.name}`).join("\n")}\n\nType the client name:`
    );
    if (!targetName) return;
    const targetClient = otherClients.find(
      (c) => c.name.toLowerCase() === targetName.toLowerCase()
    );
    if (!targetClient) {
      alert("Client not found. Make sure to type the exact name.");
      return;
    }
    const fromClient = clients.find(
      (c) => c.name === fromClientName || c.channels.includes(channelId)
    );
    if (!fromClient) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "transfer_channel",
          channelId,
          fromUserId: fromClient.id,
          toUserId: targetClient.id,
        }),
      });
      if (res.ok) {
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === fromClient.id)
              return { ...c, channels: c.channels.filter((ch) => ch !== channelId) };
            if (c.id === targetClient.id)
              return { ...c, channels: [...c.channels, channelId] };
            return c;
          })
        );
        setActiveActionMenu(null);
        setMenuPosition(null);
        alert(`Channel transferred to ${targetClient.name}`);
      } else {
        alert("Failed to transfer channel.");
      }
    } catch {
      alert("Error transferring channel.");
    }
    setActionLoading(false);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Total Channels</p>
            <p className="text-2xl font-bold text-purple-900">{allChannelRows.length}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-green-900">${allChannelRows.reduce((s, c) => s + c.revenue, 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Subscribers</p>
            <p className="text-2xl font-bold text-blue-900">{formatNumber(allChannelRows.reduce((s, c) => s + c.subscribers, 0))}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Valid Tokens</p>
            <p className="text-2xl font-bold text-amber-900">{allChannelRows.filter(c => c.tokenStatus === "valid").length} / {allChannelRows.length}</p>
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
                <th className="text-left px-4 py-3 font-semibold text-foreground">Revenue</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Token</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageChannels.map((channel) => (
                <tr key={`${channel.clientName}-${channel.channelId}`} className="border-b border-border hover:bg-slate-50 cursor-pointer" onClick={() => window.open(`https://www.youtube.com/channel/${channel.channelId}`, '_blank')}>
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
                  <td className="px-4 py-3 text-green-600 font-medium">${channel.revenue.toFixed(2)}</td>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedChannel(channel); }}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Channel Details"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                      </button>
                      <a
                        href={`https://www.youtube.com/channel/${channel.channelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                        title="View on YouTube"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 text-red-500" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (activeActionMenu === channel.channelId) {
                            setActiveActionMenu(null);
                            setMenuPosition(null);
                          } else {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setMenuPosition({ top: rect.bottom + 4, left: rect.right - 200 });
                            setActiveActionMenu(channel.channelId);
                          }
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageChannels.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">
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

      {/* Channel Detail Modal */}
      {selectedChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChannel(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Channel Details</h2>
                <button onClick={() => setSelectedChannel(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 shrink-0">
                  {selectedChannel.thumbnail ? (
                    <img src={selectedChannel.thumbnail} alt={selectedChannel.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                      {selectedChannel.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedChannel.name}</h3>
                  <p className="text-sm text-muted">{selectedChannel.channelId}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    selectedChannel.tokenStatus === "valid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    Token: {selectedChannel.tokenStatus === "valid" ? "Valid" : "Not Validated"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Subscribers</p>
                  <p className="text-lg font-bold text-blue-900">{formatNumber(selectedChannel.subscribers)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Revenue (28d)</p>
                  <p className="text-lg font-bold text-green-900">${selectedChannel.revenue.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium">Total Views</p>
                  <p className="text-lg font-bold text-purple-900">{formatNumber(selectedChannel.views)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-600 font-medium">Videos</p>
                  <p className="text-lg font-bold text-amber-900">{selectedChannel.videos.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted">Client</span>
                  <span className="font-medium text-foreground">{selectedChannel.clientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted">Category</span>
                  <span className="font-medium text-foreground">{selectedChannel.category}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={`https://www.youtube.com/channel/${selectedChannel.channelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Dot Action Menu Portal */}
      {activeActionMenu && menuPosition && (() => {
        const channel = pageChannels.find((c) => c.channelId === activeActionMenu);
        if (!channel) return null;
        return (
          <>
            <div
              className="fixed inset-0 z-[70]"
              onClick={() => { setActiveActionMenu(null); setMenuPosition(null); }}
            />
            <div
              className="fixed z-[80] bg-white rounded-lg shadow-lg border border-border py-1 min-w-[200px]"
              style={{ top: menuPosition.top, left: Math.max(8, menuPosition.left) }}
            >
              <button
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
                onClick={() => {
                  setSelectedChannel(channel);
                  setActiveActionMenu(null);
                  setMenuPosition(null);
                }}
              >
                <Eye className="w-4 h-4 text-blue-500" />
                View Details
              </button>
              <a
                href={`https://www.youtube.com/channel/${channel.channelId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2"
                onClick={() => { setActiveActionMenu(null); setMenuPosition(null); }}
              >
                <ExternalLink className="w-4 h-4 text-red-500" />
                View on YouTube
              </a>
              <button
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 flex items-center gap-2"
                onClick={() => {
                  handleTransferChannel(channel.channelId, channel.clientName);
                }}
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                Transfer to Client
              </button>
              <div className="border-t border-border my-1" />
              <button
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                onClick={() => {
                  setDeleteConfirm(channel.channelId);
                  setActiveActionMenu(null);
                  setMenuPosition(null);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Channel
              </button>
            </div>
          </>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (() => {
        const channel = allChannelRows.find((c) => c.channelId === deleteConfirm);
        if (!channel) return null;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Channel?</h3>
              <p className="text-sm text-muted mb-1">
                Are you sure you want to remove <strong>{channel.name}</strong> ({channel.channelId}) from <strong>{channel.clientName}</strong>?
              </p>
              <p className="text-xs text-red-500 mb-4">This will remove the channel from the client&apos;s account. The YouTube channel itself will not be affected.</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-slate-50"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteChannel(channel.channelId, channel.clientName)}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1.5"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

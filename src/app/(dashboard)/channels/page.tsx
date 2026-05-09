"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  ExternalLink,
  Search,
  X,
  Wifi,
  WifiOff,
  Loader2,
  RotateCcw,
  Radio,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatNumber } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";


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

interface StoredChannel {
  id: string;
  category: string;
  addedDate: string;
  status: "active" | "delinked";
}

const STORAGE_KEY = "bainsla_channels";
const PER_PAGE_OPTIONS = [10, 25, 50, 100];
const CATEGORIES = ["Music", "Entertainment"];

function getStoredChannels(): StoredChannel[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredChannels(channels: StoredChannel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
}

export default function ChannelsPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.accessToken;

  const { data: myChannels, isReal, loading } = useYouTubeData<YouTubeChannel[]>(
    "channels",
    {},
    []
  );

  const [channelDataMap, setChannelDataMap] = useState<Record<string, YouTubeChannel>>({});
  const [storedChannels, setStoredChannels] = useState<StoredChannel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [channelIdInput, setChannelIdInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [addingChannel, setAddingChannel] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setStoredChannels(getStoredChannels());
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const activeStored = storedChannels.filter((c) => c.status === "active");
    if (activeStored.length === 0) return;

    const idsToFetch = activeStored
      .map((c) => c.id)
      .filter((id) => !channelDataMap[id]);
    if (idsToFetch.length === 0) return;

    const fetchChannels = async () => {
      for (const id of idsToFetch) {
        try {
          const res = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(id)}`);
          const json = await res.json();
          if (res.ok && json.data?.length) {
            setChannelDataMap((prev) => ({ ...prev, [id]: json.data[0] }));
          }
        } catch {
          // skip
        }
      }
    };
    fetchChannels();
  }, [isAuthenticated, storedChannels, channelDataMap]);

  const handleAddChannel = useCallback(async () => {
    const id = channelIdInput.trim();
    if (!id || !categoryInput) {
      setAddError("Please enter Channel ID and select Category");
      return;
    }

    if (storedChannels.some((c) => c.id === id)) {
      setAddError("Channel already exists");
      return;
    }

    setAddingChannel(true);
    setAddError(null);

    try {
      const res = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(id)}`);
      const json = await res.json();

      if (!res.ok || !json.data?.length) {
        setAddError("Channel not found. Please check the Channel ID.");
        setAddingChannel(false);
        return;
      }

      const channelData = json.data[0] as YouTubeChannel;
      const actualId = channelData.id || id;

      const newStored: StoredChannel = {
        id: actualId,
        category: categoryInput,
        addedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
        status: "active",
      };

      const updatedChannels = [...storedChannels, newStored];
      saveStoredChannels(updatedChannels);
      setStoredChannels(updatedChannels);
      setChannelDataMap((prev) => ({ ...prev, [actualId]: channelData }));
      setShowModal(false);
      setChannelIdInput("");
      setCategoryInput("");
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAddingChannel(false);
    }
  }, [channelIdInput, categoryInput, storedChannels]);

  const handleDelink = (channelId: string) => {
    const updated = storedChannels.map((c) =>
      c.id === channelId ? { ...c, status: "delinked" as const } : c
    );
    saveStoredChannels(updated);
    setStoredChannels(updated);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  type ChannelRow = {
    id: string;
    name: string;
    handle: string;
    thumbnail: string;
    subscribers: number;
    videos: number;
    views: number;
    category: string;
    addedDate: string;
    isOwn: boolean;
    status: "active" | "delinked";
  };

  const activeChannels: ChannelRow[] = useMemo(() => {
    const rows: ChannelRow[] = [];

    if (isReal) {
      for (const ch of myChannels) {
        rows.push({
          id: ch.id || "",
          name: ch.snippet?.title || "Unknown",
          handle: ch.snippet?.customUrl || "",
          thumbnail: ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.default?.url || "",
          subscribers: Number(ch.statistics?.subscriberCount || 0),
          videos: Number(ch.statistics?.videoCount || 0),
          views: Number(ch.statistics?.viewCount || 0),
          category: "Music",
          addedDate: "-",
          isOwn: true,
          status: "active",
        });
      }
    }

    for (const sc of storedChannels.filter((c) => c.status === "active")) {
      if (rows.some((r) => r.id === sc.id)) continue;
      const data = channelDataMap[sc.id];
      rows.push({
        id: sc.id,
        name: data?.snippet?.title || sc.id,
        handle: data?.snippet?.customUrl || "",
        thumbnail: data?.snippet?.thumbnails?.medium?.url || data?.snippet?.thumbnails?.default?.url || "",
        subscribers: Number(data?.statistics?.subscriberCount || 0),
        videos: Number(data?.statistics?.videoCount || 0),
        views: Number(data?.statistics?.viewCount || 0),
        category: sc.category,
        addedDate: sc.addedDate,
        isOwn: false,
        status: "active",
      });
    }

    return rows;
  }, [isReal, myChannels, storedChannels, channelDataMap]);

  const filteredChannels = useMemo(() => {
    let result = activeChannels;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter((c) => c.category === categoryFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "subscribers": cmp = a.subscribers - b.subscribers; break;
        case "videos": cmp = a.videos - b.videos; break;
        case "views": cmp = a.views - b.views; break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        default: cmp = a.name.localeCompare(b.name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [activeChannels, searchQuery, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredChannels.length / perPage);
  const pageChannels = filteredChannels.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalActive = activeChannels.length;

  const SortIcon = ({ field }: { field: string }) => (
    <svg
      className={`w-3 h-3 ml-1 inline cursor-pointer ${sortField === field ? "text-primary" : "text-gray-400"}`}
      onClick={() => handleSort(field)}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d={sortDir === "desc" && sortField === field ? "M7 14l5 5 5-5" : "M7 10l5-5 5 5"} />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Channels</span>
        <span>›</span>
        <span className="text-foreground font-medium">Active Channels</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Channels</p>
            <p className="text-2xl font-bold text-blue-900">{totalActive}</p>
            <p className="text-xs text-blue-500">All registered channels</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Active Channels</p>
            <p className="text-2xl font-bold text-green-900">{totalActive}</p>
            <p className="text-xs text-green-500">Channels with active status</p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
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
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search channels by name..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors px-3 py-2 border border-border rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Total + Add Channel */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <p className="text-sm text-muted">
            Total Channels: <span className="font-semibold text-primary">{filteredChannels.length}</span>
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Channel
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && isAuthenticated && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted">Loading channels...</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Channel <SortIcon field="name" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Subscribers <SortIcon field="subscribers" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Videos <SortIcon field="videos" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Views <SortIcon field="views" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Category <SortIcon field="category" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Added Date
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageChannels.map((channel) => (
                <tr key={channel.id} className="border-b border-border hover:bg-slate-50 transition-colors">
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
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {channel.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{channel.name}</span>
                          <a
                            href={`https://www.youtube.com/channel/${channel.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on YouTube"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-red-500 hover:text-red-600" />
                          </a>
                        </div>
                        <p className="text-xs text-muted">{channel.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(channel.subscribers)}</td>
                  <td className="px-4 py-3 text-foreground">{channel.videos.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(channel.views)}</td>
                  <td className="px-4 py-3 text-foreground">{channel.category}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{channel.addedDate}</td>
                  <td className="px-4 py-3">
                    {!channel.isOwn && (
                      <button
                        onClick={() => handleDelink(channel.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delink
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pageChannels.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    {loading ? "Loading..." : "No channels found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50">
            <p className="text-sm text-muted">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredChannels.length)} of {filteredChannels.length} results
            </p>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "hover:bg-white border border-border"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Add Channel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add New Channel</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setChannelIdInput("");
                  setCategoryInput("");
                  setAddError(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Channel ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={channelIdInput}
                    onChange={(e) => setChannelIdInput(e.target.value)}
                    placeholder="UC..."
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {addError && (
                <p className="text-sm text-red-500 mt-3">{addError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => {
                  setShowModal(false);
                  setChannelIdInput("");
                  setCategoryInput("");
                  setAddError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChannel}
                disabled={addingChannel}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {addingChannel ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

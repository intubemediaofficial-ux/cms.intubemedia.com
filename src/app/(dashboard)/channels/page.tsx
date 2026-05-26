"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Wifi,
  WifiOff,
  Loader2,
  Radio,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  ArrowRightLeft,
  ClipboardList,
  Link2,
  Copy,
  Mail,
  Check,
  MoreVertical,
  Key,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatNumber } from "@/lib/utils";
import { useYouTubeData } from "@/lib/hooks/useYouTubeData";
import { downloadCSV } from "@/lib/csv-export";
import { usePendingGuard } from "@/components/ReadOnlyBanner";

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
  channelType: string;
  tokenStatus: string;
  cms: string;
  addedDate: string;
  delinkedDate?: string;
  status: "active" | "delinked" | "transferred" | "pending_approval";
}

interface ChannelRequest {
  id: string;
  channelId: string;
  channelName: string;
  requestedBy: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

const STORAGE_KEY = "bainsla_channels";
const REQUESTS_KEY = "bainsla_channel_requests";
const PER_PAGE_OPTIONS = [10, 25, 50, 100];
const CATEGORIES = ["Music", "Entertainment", "Education", "Comedy", "Gaming", "News", "Sports"];
const CHANNEL_TYPES = ["Original", "Refurbished", "Licensed"];
const TOKEN_STATUSES = ["Valid", "Invalid", "Expired", "N/A"];
const DEFAULT_NETWORK_OPTIONS = ["InTubeMedia", "WMG - MUSIC", "Sony Music", "T-Series", "Other"];

type TabType = "channels" | "requests" | "bulk" | "transferred";

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
  // Sync channel IDs to KV — active go to channels, pending go to pendingChannels
  const activeIds = channels.filter((c) => c.status === "active").map((c) => c.id);
  const pendingIds = channels.filter((c) => c.status === "pending_approval").map((c) => c.id);
  fetch("/api/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channels: activeIds, pendingChannels: pendingIds }),
  }).catch(() => { /* silent - best effort sync */ });
}

function getChannelRequests(): ChannelRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveChannelRequests(requests: ChannelRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export default function ChannelsPage() {
  const { data: session, status } = useSession();
  const hasAccessToken = !!session?.accessToken;
  const isAdmin = session?.user?.role === "admin";
  const isAuthenticated = status === "authenticated";
  const guardPending = usePendingGuard();

  const { data: myChannels, isReal, loading } = useYouTubeData<YouTubeChannel[]>(
    "channels",
    {},
    []
  );

  const [activeTab, setActiveTab] = useState<TabType>("channels");
  const [channelDataMap, setChannelDataMap] = useState<Record<string, YouTubeChannel>>({});
  const [storedChannels, setStoredChannels] = useState<StoredChannel[]>(getStoredChannels);
  const [channelRequests, setChannelRequests] = useState<ChannelRequest[]>(getChannelRequests);
  const [showModal, setShowModal] = useState(false);
  const [channelIdInput, setChannelIdInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [channelTypeInput, setChannelTypeInput] = useState("");
  const [cmsInput, setCmsInput] = useState("");
  const [addingChannel, setAddingChannel] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [channelTypeFilter, setChannelTypeFilter] = useState("");
  const [tokenStatusFilter, setTokenStatusFilter] = useState("");
  const [cmsFilter, setCmsFilter] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkChannelType, setBulkChannelType] = useState("");
  const [bulkCms, setBulkCms] = useState("");
  const [bulkAdding, setBulkAdding] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  // Invite Link Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteChannelId, setInviteChannelId] = useState("");
  const [inviteChannelTitle, setInviteChannelTitle] = useState("");
  const [inviteOAuthUrl, setInviteOAuthUrl] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSentMessage, setInviteSentMessage] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [tokenStatuses, setTokenStatuses] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [userNetworks, setUserNetworks] = useState<string[]>([]);
  const [showChannelDetail, setShowChannelDetail] = useState<string | null>(null);
  const [channelDetailData, setChannelDetailData] = useState<{
    revenue?: number;
    views?: number;
    subscribers?: number;
    videos?: number;
    channelTitle?: string;
    tokenUpdatedAt?: string;
  } | null>(null);
  const [channelDetailLoading, setChannelDetailLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const activeStored = storedChannels.filter((c) => c.status === "active" || c.status === "pending_approval");
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

  // Auto-refresh channel stats (subscribers, views, videos) every 60s
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const refreshChannelStats = useCallback(async () => {
    const activeStored = storedChannels.filter((c) => c.status === "active" || c.status === "pending_approval");
    if (activeStored.length === 0) return;
    const results = await Promise.allSettled(
      activeStored.map((c) =>
        fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(c.id)}`)
          .then((r) => r.json())
          .then((j) => ({ id: c.id, data: j.data?.[0] as YouTubeChannel | undefined }))
      )
    );
    const newMap: Record<string, YouTubeChannel> = { ...channelDataMap };
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.data) {
        newMap[r.value.id] = r.value.data;
      }
    }
    setChannelDataMap(newMap);
    setLastRefresh(new Date());
  }, [storedChannels, channelDataMap]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(refreshChannelStats, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshChannelStats]);

  // Fetch token statuses for all stored channels + auto-refresh every 30s
  const fetchTokenStatuses = useCallback(() => {
    const allStored = storedChannels.filter((c) => c.status === "active" || c.status === "transferred");
    if (allStored.length === 0) return;

    const ids = allStored.map((c) => c.id).join(",");
    fetch(`/api/channel-tokens?action=bulkTokenStatus&channelIds=${encodeURIComponent(ids)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.statuses) {
          const statusMap: Record<string, string> = {};
          for (const [id, info] of Object.entries(json.data.statuses)) {
            const typedInfo = info as { status: string };
            statusMap[id] = typedInfo.status === "valid" ? "Valid" : typedInfo.status === "expired" ? "Expired" : "Invalid";
          }
          setTokenStatuses(statusMap);
        }
      })
      .catch(() => {});
  }, [storedChannels]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTokenStatuses();
    const interval = setInterval(fetchTokenStatuses, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchTokenStatuses]);

  // Restore channels from KV if localStorage is empty (e.g. after logout/login)
  // Then sync localStorage to KV, and sync approval statuses
  useEffect(() => {
    if (!isAuthenticated) return;

    fetch("/api/users?action=me")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) return;
        const kvApproved: string[] = j.data.channels || [];
        const kvPending: string[] = j.data.pendingChannels || [];
        const currentStored = getStoredChannels();

        // If localStorage is empty but KV has channels, restore from KV
        if (currentStored.length === 0 && (kvApproved.length > 0 || kvPending.length > 0)) {
          const restored: StoredChannel[] = [];
          for (const id of kvApproved) {
            restored.push({
              id,
              category: "",
              channelType: "",
              tokenStatus: "N/A",
              cms: "",
              addedDate: new Date().toISOString().split("T")[0],
              status: "active",
            });
          }
          for (const id of kvPending) {
            restored.push({
              id,
              category: "",
              channelType: "",
              tokenStatus: "N/A",
              cms: "",
              addedDate: new Date().toISOString().split("T")[0],
              status: "pending_approval",
            });
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
          setStoredChannels(restored);
          return; // Skip other syncs — restored data is already in sync with KV
        }

        // Sync approval status from KV — if admin approved a pending channel, update localStorage
        // Also remove channels that admin has deleted (no longer in KV at all)
        const kvApprovedSet = new Set(kvApproved);
        const kvPendingSet = new Set(kvPending);
        const kvAllSet = new Set([...kvApproved, ...kvPending]);
        let changed = false;
        const updated = currentStored.map((ch) => {
          if (ch.status === "pending_approval" && kvApprovedSet.has(ch.id)) {
            changed = true;
            return { ...ch, status: "active" as const };
          }
          if (ch.status === "pending_approval" && !kvPendingSet.has(ch.id) && !kvApprovedSet.has(ch.id)) {
            changed = true;
            return null; // rejected by admin — remove
          }
          // If admin removed an active channel from KV, remove from localStorage too
          if (ch.status === "active" && !kvAllSet.has(ch.id) && kvAllSet.size > 0) {
            changed = true;
            return null; // removed by admin
          }
          return ch;
        }).filter(Boolean) as StoredChannel[];
        if (changed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setStoredChannels(updated);
        }

        // Sync localStorage channels to KV (only if localStorage has data)
        const activeChannelIds = (changed ? updated : currentStored).filter((c) => c.status === "active").map((c) => c.id);
        if (activeChannelIds.length > 0) {
          const pendingIds = (changed ? updated : currentStored).filter((c) => c.status === "pending_approval").map((c) => c.id);
          fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channels: activeChannelIds, pendingChannels: pendingIds }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fetch user's assigned networks from admin
  useEffect(() => {
    if (!isAuthenticated || isAdmin) return;
    fetch("/api/users?action=me")
      .then((r) => r.json())
      .then((j) => {
        if (j.data?.networks?.length) {
          setUserNetworks(j.data.networks.map((n: { networkName: string }) => n.networkName));
        }
      })
      .catch(() => {});
  }, [isAuthenticated, isAdmin]);

  // Use admin-assigned networks if available, fallback to defaults
  const networkOptions = userNetworks.length > 0 ? userNetworks : DEFAULT_NETWORK_OPTIONS;

  const [inviteError, setInviteError] = useState("");

  const handleGenerateInviteLink = useCallback((channelId: string, channelTitle: string) => {
    if (guardPending()) return;
    setGeneratingLink(true);
    setInviteChannelId(channelId);
    setInviteChannelTitle(channelTitle || channelId);
    setInviteCopied(false);
    setInviteEmails("");
    setInviteSentMessage("");
    setInviteError("");
    setActiveActionMenu(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setInviteError("Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      setInviteOAuthUrl("");
      setShowInviteModal(true);
      setGeneratingLink(false);
      return;
    }

    const redirectUri = `${window.location.origin}/callback`;
    const scopes = [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    ].join("+");

    const oauthUrl = `https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=${encodeURIComponent(clientId)}&prompt=consent&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${channelId}`;

    setInviteOAuthUrl(oauthUrl);
    setShowInviteModal(true);
    setGeneratingLink(false);
  }, []);

  const handleCopyInviteUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteOAuthUrl);
      setInviteCopied(true);
    } catch {
      // Fallback: select text for manual copy
      const textArea = document.createElement("textarea");
      textArea.value = inviteOAuthUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setInviteCopied(true);
    }
    setTimeout(() => setInviteCopied(false), 3000);
  }, [inviteOAuthUrl]);

  const handleSendInviteEmail = useCallback(async () => {
    const emails = inviteEmails.split(/[,;\s]+/).filter((e) => e.includes("@"));
    if (emails.length === 0) return;

    setInviteSending(true);
    // For now, copy the link to clipboard and show a message
    // Email sending requires a backend email service (SendGrid, etc.)
    await navigator.clipboard.writeText(inviteOAuthUrl);
    setInviteSentMessage(`Link copied! Please share it manually with: ${emails.join(", ")}`);
    setInviteSending(false);
  }, [inviteEmails, inviteOAuthUrl]);

  const handleAddChannel = useCallback(async () => {
    if (guardPending()) return;
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
      const existingIds = storedChannels.map((c) => c.id).join(",");
      const res = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(id)}&storedChannelIds=${encodeURIComponent(existingIds)}`);
      const json = await res.json();

      let actualId = id;
      let channelData: YouTubeChannel | null = null;

      if (res.ok && json.data?.length) {
        channelData = json.data[0] as YouTubeChannel;
        actualId = channelData.id || id;
      }
      // If lookup fails but ID starts with UC, still add it (channel data will load later when token is validated)
      if (!channelData && !id.startsWith("UC")) {
        setAddError("Channel not found. Please enter a valid Channel ID (starts with UC).");
        setAddingChannel(false);
        return;
      }

      if (storedChannels.some((c) => c.id === actualId)) {
        setAddError("Channel already exists");
        setAddingChannel(false);
        return;
      }

      const newStored: StoredChannel = {
        id: actualId,
        category: categoryInput,
        channelType: channelTypeInput || "Original",
        tokenStatus: "Invalid",
        cms: cmsInput || "InTubeMedia",
        addedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
        status: "pending_approval",
      };

      const updatedChannels = [...storedChannels, newStored];
      saveStoredChannels(updatedChannels);
      setStoredChannels(updatedChannels);
      if (channelData) {
        setChannelDataMap((prev) => ({ ...prev, [actualId]: channelData! }));
      }
      setShowModal(false);
      setChannelIdInput("");
      setCategoryInput("");
      setChannelTypeInput("");
      setCmsInput("");
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAddingChannel(false);
    }
  }, [channelIdInput, categoryInput, channelTypeInput, cmsInput, storedChannels]);

  const handleDelink = (channelId: string) => {
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const updated = storedChannels.map((c) =>
      c.id === channelId ? { ...c, status: "delinked" as const, delinkedDate: now } : c
    );
    saveStoredChannels(updated);
    setStoredChannels(updated);
    // Delete channel token from KV when delinked
    fetch(`/api/channel-tokens?action=deleteToken&channelId=${encodeURIComponent(channelId)}`)
      .catch(() => {});
  };

  const handleTransfer = (channelId: string) => {
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const updated = storedChannels.map((c) =>
      c.id === channelId ? { ...c, status: "transferred" as const, delinkedDate: now } : c
    );
    saveStoredChannels(updated);
    setStoredChannels(updated);
    // Delete channel token from KV when transferred
    fetch(`/api/channel-tokens?action=deleteToken&channelId=${encodeURIComponent(channelId)}`)
      .catch(() => {});
  };

  const handleRelink = (channelId: string) => {
    const updated = storedChannels.map((c) =>
      c.id === channelId ? { ...c, status: "active" as const, delinkedDate: undefined } : c
    );
    saveStoredChannels(updated);
    setStoredChannels(updated);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (guardPending()) return;
    const updated = storedChannels.filter((c) => c.id !== channelId);
    saveStoredChannels(updated);
    setStoredChannels(updated);
    setChannelDataMap((prev) => {
      const copy = { ...prev };
      delete copy[channelId];
      return copy;
    });
    // Remove channel from user's KV record so it doesn't reappear on refresh
    fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeChannels: [channelId] }),
    }).catch(() => {});
    // Delete channel token from KV so it doesn't persist as stale/valid
    fetch(`/api/channel-tokens?action=deleteToken&channelId=${encodeURIComponent(channelId)}`)
      .catch(() => {});
    setShowDeleteConfirm(null);
  };

  const handleViewChannelDetail = async (channelId: string) => {
    setShowChannelDetail(channelId);
    setChannelDetailLoading(true);
    setChannelDetailData(null);

    try {
      const res = await fetch(`/api/channel-tokens?action=tokenStatus&channelId=${encodeURIComponent(channelId)}`);
      const json = await res.json();
      const channelRow = allChannelRows.find((c) => c.id === channelId);

      setChannelDetailData({
        revenue: 0,
        views: channelRow?.views || 0,
        subscribers: channelRow?.subscribers || 0,
        videos: channelRow?.videos || 0,
        channelTitle: json.data?.channelTitle || channelRow?.name || channelId,
        tokenUpdatedAt: json.data?.updatedAt || undefined,
      });
    } catch {
      setChannelDetailData(null);
    } finally {
      setChannelDetailLoading(false);
    }
  };

  const handleBulkAdd = useCallback(async () => {
    if (guardPending()) return;
    const ids = bulkInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (ids.length === 0) {
      setBulkResult("Please enter at least one Channel ID");
      return;
    }

    setBulkAdding(true);
    setBulkResult(null);
    let added = 0;
    let skipped = 0;

    for (const id of ids) {
      if (storedChannels.some((c) => c.id === id)) {
        skipped++;
        continue;
      }

      try {
        const res = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(id)}`);
        const json = await res.json();

        if (res.ok && json.data?.length) {
          const channelData = json.data[0] as YouTubeChannel;
          const actualId = channelData.id || id;

          const newStored: StoredChannel = {
            id: actualId,
            category: bulkCategory || "Music",
            channelType: bulkChannelType || "Original",
            tokenStatus: "Invalid",
            cms: bulkCms || "InTubeMedia",
            addedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
            status: "active",
          };

          setStoredChannels((prev) => {
            const updated = [...prev, newStored];
            saveStoredChannels(updated);
            return updated;
          });
          setChannelDataMap((prev) => ({ ...prev, [actualId]: channelData }));
          added++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    setBulkAdding(false);
    setBulkResult(`Added ${added} channel(s). ${skipped > 0 ? `Skipped ${skipped} (already exist or not found).` : ""}`);
    if (added > 0) setBulkInput("");
  }, [bulkInput, bulkCategory, bulkChannelType, bulkCms, storedChannels]);

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
    setChannelTypeFilter("");
    setTokenStatusFilter("");
    setCmsFilter("");
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
    channelType: string;
    tokenStatus: string;
    cms: string;
    addedDate: string;
    delinkedDate: string;
    isOwn: boolean;
    status: "active" | "delinked" | "transferred" | "pending_approval";
  };

  const allChannelRows: ChannelRow[] = useMemo(() => {
    const rows: ChannelRow[] = [];

    if (isReal) {
      for (const ch of myChannels) {
        const storedInfo = storedChannels.find((sc) => sc.id === ch.id);
        rows.push({
          id: ch.id || "",
          name: ch.snippet?.title || "Unknown",
          handle: ch.snippet?.customUrl || "",
          thumbnail: ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.default?.url || "",
          subscribers: Number(ch.statistics?.subscriberCount || 0),
          videos: Number(ch.statistics?.videoCount || 0),
          views: Number(ch.statistics?.viewCount || 0),
          category: storedInfo?.category || "Music",
          channelType: storedInfo?.channelType || "Original",
          tokenStatus: tokenStatuses[ch.id || ""] || storedInfo?.tokenStatus || "Invalid",
          cms: storedInfo?.cms || "InTubeMedia",
          addedDate: storedInfo?.addedDate || "-",
          delinkedDate: storedInfo?.delinkedDate || "-",
          isOwn: true,
          status: storedInfo?.status || "active",
        });
      }
    }

    for (const sc of storedChannels) {
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
        channelType: sc.channelType || "Original",
        tokenStatus: tokenStatuses[sc.id] || sc.tokenStatus || "Invalid",
        cms: sc.cms || "InTubeMedia",
        addedDate: sc.addedDate,
        delinkedDate: sc.delinkedDate || "-",
        isOwn: false,
        status: sc.status,
      });
    }

    return rows;
  }, [isReal, myChannels, storedChannels, channelDataMap, tokenStatuses]);

  const activeChannels = allChannelRows.filter((c) => c.status === "active" || c.status === "pending_approval");
  const transferredChannels = allChannelRows.filter((c) => c.status === "transferred");
  const channelsWithToken = activeChannels.filter((c) => c.tokenStatus === "Valid");
  const transferredWithToken = transferredChannels.filter((c) => c.tokenStatus === "Valid");

  const filteredChannels = useMemo(() => {
    const source = activeTab === "transferred" ? transferredChannels : activeChannels;
    let result = source;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) result = result.filter((c) => c.category === categoryFilter);
    if (channelTypeFilter) result = result.filter((c) => c.channelType === channelTypeFilter);
    if (tokenStatusFilter) result = result.filter((c) => c.tokenStatus === tokenStatusFilter);
    if (cmsFilter) result = result.filter((c) => c.cms === cmsFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "subscribers": cmp = a.subscribers - b.subscribers; break;
        case "videos": cmp = a.videos - b.videos; break;
        case "views": cmp = a.views - b.views; break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        case "channelType": cmp = a.channelType.localeCompare(b.channelType); break;
        case "tokenStatus": cmp = a.tokenStatus.localeCompare(b.tokenStatus); break;
        case "cms": cmp = a.cms.localeCompare(b.cms); break;
        default: cmp = a.name.localeCompare(b.name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [activeTab, activeChannels, transferredChannels, searchQuery, categoryFilter, channelTypeFilter, tokenStatusFilter, cmsFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredChannels.length / perPage);
  const pageChannels = filteredChannels.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleExportCSV = () => {
    const headers = ["Channel", "Channel ID", "Subscribers", "Videos", "Views", "Token Status", "Network", "Category", "Linked Date", "Delinked Date"];
    const rows = filteredChannels.map((c) => [
      c.name, c.id, String(c.subscribers), String(c.videos), String(c.views),
      c.tokenStatus, c.cms, c.category, c.addedDate, c.delinkedDate,
    ]);
    downloadCSV(headers, rows, `channels-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const renderSortIcon = (field: string) => (
    <svg
      className={`w-3 h-3 ml-1 inline cursor-pointer ${sortField === field ? "text-primary" : "text-gray-400"}`}
      onClick={() => handleSort(field)}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d={sortDir === "desc" && sortField === field ? "M7 14l5 5 5-5" : "M7 10l5-5 5 5"} />
    </svg>
  );

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "channels", label: "Channels", icon: <Radio className="w-4 h-4" /> },
    { key: "requests", label: "Channel Requests", icon: <ClipboardList className="w-4 h-4" /> },
    { key: "bulk", label: "Add Channel (Bulk)", icon: <Upload className="w-4 h-4" /> },
    { key: "transferred", label: "Transferred Channels", icon: <ArrowRightLeft className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Channels</span>
        <span>›</span>
        <span className="text-foreground font-medium">
          {tabs.find((t) => t.key === activeTab)?.label || "Channels"}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {(activeTab === "channels" || activeTab === "transferred") && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${activeTab === "transferred" ? "bg-purple-50 border-purple-200" : "bg-blue-50 border-blue-200"} border rounded-xl p-5 flex items-center gap-4`}>
              <div className={`w-12 h-12 ${activeTab === "transferred" ? "bg-purple-500" : "bg-blue-500"} rounded-xl flex items-center justify-center`}>
                {activeTab === "transferred" ? <ArrowRightLeft className="w-6 h-6 text-white" /> : <Radio className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className={`text-sm ${activeTab === "transferred" ? "text-purple-600" : "text-blue-600"} font-medium`}>
                  {activeTab === "transferred" ? "Transferred Channels" : "Total Channels"}
                </p>
                <p className={`text-2xl font-bold ${activeTab === "transferred" ? "text-purple-900" : "text-blue-900"}`}>
                  {activeTab === "transferred" ? transferredChannels.length : activeChannels.length}
                </p>
                <p className={`text-xs ${activeTab === "transferred" ? "text-purple-500" : "text-blue-500"}`}>
                  {activeTab === "transferred" ? "Channels transferred to other partners" : "All registered channels"}
                </p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Channels With Token</p>
                <p className="text-2xl font-bold text-green-900">
                  {activeTab === "transferred" ? transferredWithToken.length : channelsWithToken.length}
                </p>
                <p className="text-xs text-green-500">Channels with active tokens</p>
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
                Sign in to see data
              </div>
            )}
          </div>

          {/* Approved channels needing token validation banner */}
          {activeChannels.filter((c) => c.status === "active" && c.tokenStatus !== "Valid").length > 0 && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Channel Approved — Token Validate Karo!</p>
                <p className="text-xs text-green-700 mt-1">
                  {activeChannels.filter((c) => c.status === "active" && c.tokenStatus !== "Valid").length} channel(s) approved hain lekin token validate nahi hai. 
                  Neeche channel ke row mein &quot;Generate Invite Link&quot; button click karo → link copy karo → browser mein open karo → Google se authorize karo → token valid ho jaayega.
                </p>
              </div>
            </div>
          )}

          {/* Pending approval banner */}
          {activeChannels.filter((c) => c.status === "pending_approval").length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Channels Pending Approval</p>
                <p className="text-xs text-amber-700 mt-1">
                  {activeChannels.filter((c) => c.status === "pending_approval").length} channel(s) admin ke approval ka wait kar rahe hain. Admin approve kare tab token validate kar sakte ho.
                </p>
              </div>
            </div>
          )}

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
                value={tokenStatusFilter}
                onChange={(e) => { setTokenStatusFilter(e.target.value); setCurrentPage(1); }}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Token Status</option>
                {TOKEN_STATUSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={cmsFilter}
                onChange={(e) => { setCmsFilter(e.target.value); setCurrentPage(1); }}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Networks</option>
                {networkOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={resetFilters}
                className="flex items-center justify-center w-9 h-9 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
              </select>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center w-9 h-9 border border-border rounded-lg text-muted hover:bg-slate-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Total + Live Stats + Add Channel + Download */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted">
                  Total Channels: <span className="font-semibold text-primary">{filteredChannels.length}</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live Stats</span>
                  <span className="text-muted">· Updated {lastRefresh.toLocaleTimeString()}</span>
                </div>
                <button
                  onClick={refreshChannelStats}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
                  title="Refresh channel stats now"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm text-muted hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {isAuthenticated && activeTab === "channels" && (
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
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      CHANNEL {renderSortIcon("name")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      SUBSCRIBERS {renderSortIcon("subscribers")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      VIDEOS {renderSortIcon("videos")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      VIEWS {renderSortIcon("views")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      TOKEN STATUS {renderSortIcon("tokenStatus")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      NETWORK {renderSortIcon("cms")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      CATEGORY {renderSortIcon("category")}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      LINKED DATE
                    </th>
                    {activeTab === "transferred" && (
                      <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        DELINKED DATE
                      </th>
                    )}
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
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
                                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </a>
                            </div>
                            <p className="text-xs text-muted">{channel.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{formatNumber(channel.subscribers)}</td>
                      <td className="px-4 py-3 text-foreground">{channel.videos.toLocaleString()}</td>
                      <td className="px-4 py-3 text-foreground">{formatNumber(channel.views)}</td>
                      <td className="px-4 py-3">
                        {channel.status === "pending_approval" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            ⏳ Pending Approval
                          </span>
                        ) : (
                          <button
                            onClick={() => channel.tokenStatus === "Valid" ? handleViewChannelDetail(channel.id) : undefined}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              channel.tokenStatus === "Valid"
                                ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 transition-colors"
                                : channel.tokenStatus === "Expired"
                                ? "bg-amber-100 text-amber-700 cursor-default"
                                : "bg-red-100 text-red-700 cursor-default"
                            }`}
                          >
                            {channel.tokenStatus === "Valid" && (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            )}
                            {channel.tokenStatus}
                            {channel.tokenStatus === "Valid" && (
                              <Eye className="w-3 h-3 ml-0.5 text-green-500" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">{channel.cms}</td>
                      <td className="px-4 py-3 text-foreground">{channel.category}</td>
                      <td className="px-4 py-3 text-muted">{channel.addedDate}</td>
                      {activeTab === "transferred" && (
                        <td className="px-4 py-3 text-muted">{channel.delinkedDate}</td>
                      )}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (activeActionMenu === channel.id) {
                              setActiveActionMenu(null);
                              setMenuPosition(null);
                            } else {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setMenuPosition({ top: rect.bottom + 4, left: rect.right - 200 });
                              setActiveActionMenu(channel.id);
                            }
                          }}
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-muted" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pageChannels.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted">
                        {loading ? "Loading..." : activeTab === "transferred" ? "No transferred channels" : "No channels found"}
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
        </>
      )}

      {/* Channel Requests Tab */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Channel Requests</h2>
            <span className="text-sm text-muted">{channelRequests.filter((r) => r.status === "pending").length} pending</span>
          </div>

          {channelRequests.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Channel Requests</h3>
              <p className="text-sm text-muted">Channel requests from clients will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold">Channel ID</th>
                    <th className="text-left px-4 py-3 font-semibold">Channel Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Requested By</th>
                    <th className="text-left px-4 py-3 font-semibold">Request Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {channelRequests.map((req) => (
                    <tr key={req.id} className="border-b border-border">
                      <td className="px-4 py-3 text-muted text-xs font-mono">{req.channelId}</td>
                      <td className="px-4 py-3">{req.channelName}</td>
                      <td className="px-4 py-3">{req.requestedBy}</td>
                      <td className="px-4 py-3 text-muted">{req.requestDate}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          req.status === "pending" ? "bg-amber-100 text-amber-700" :
                          req.status === "approved" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const updated = channelRequests.map((r) =>
                                  r.id === req.id ? { ...r, status: "approved" as const } : r
                                );
                                saveChannelRequests(updated);
                                setChannelRequests(updated);
                              }}
                              className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const updated = channelRequests.map((r) =>
                                  r.id === req.id ? { ...r, status: "rejected" as const } : r
                                );
                                saveChannelRequests(updated);
                                setChannelRequests(updated);
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Channel (Bulk) Tab */}
      {activeTab === "bulk" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Add Channels in Bulk</h2>
          <p className="text-sm text-muted mb-6">
            Enter multiple Channel IDs (one per line, or comma/semicolon separated) to add them all at once.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={bulkChannelType}
              onChange={(e) => setBulkChannelType(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select Channel Type</option>
              {CHANNEL_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={bulkCms}
              onChange={(e) => setBulkCms(e.target.value)}
              className="border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select Network</option>
              {networkOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="UC...\nUC...\nUC..."
            className="w-full h-40 px-4 py-3 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />

          {bulkResult && (
            <p className={`text-sm mt-3 ${bulkResult.startsWith("Added 0") ? "text-red-500" : "text-green-600"}`}>
              {bulkResult}
            </p>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={handleBulkAdd}
              disabled={bulkAdding || !isAuthenticated}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {bulkAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {bulkAdding ? "Adding..." : "Add All Channels"}
            </button>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add New Channel</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setChannelIdInput("");
                  setCategoryInput("");
                  setChannelTypeInput("");
                  setCmsInput("");
                  setAddError(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Channel Type
                  </label>
                  <select
                    value={channelTypeInput}
                    onChange={(e) => setChannelTypeInput(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Select Type</option>
                    {CHANNEL_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Network
                  </label>
                  <select
                    value={cmsInput}
                    onChange={(e) => setCmsInput(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Select Network</option>
                    {networkOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {addError && (
                <p className="text-sm text-red-500">{addError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => {
                  setShowModal(false);
                  setChannelIdInput("");
                  setCategoryInput("");
                  setChannelTypeInput("");
                  setCmsInput("");
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

      {/* Channel Invite Link Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Channel Invite Link Generated</h2>
                  <p className="text-sm text-muted mt-0.5">For channel: {inviteChannelTitle}</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {inviteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">Error: {inviteError}</p>
                </div>
              )}
              {/* OAuth URL */}
              {inviteOAuthUrl && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">OAuth Authorization URL:</label>
                  <button
                    onClick={handleCopyInviteUrl}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      inviteCopied
                        ? "bg-green-100 text-green-700"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {inviteCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 border border-border rounded-lg p-3 max-h-32 overflow-y-auto select-all cursor-text">
                  <p className="text-xs text-foreground break-all font-mono select-all">{inviteOAuthUrl}</p>
                </div>
                <p className="text-xs text-muted mt-1.5">Share this link with the channel owner. They need to open it, sign in with their Google account, and authorize access.</p>
              </div>
              )}

              {/* Send via Email */}
              {inviteOAuthUrl && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Send Invite via Email (max 5):
                </label>
                <div className="space-y-2">
                  <label className="text-xs text-muted">Email Addresses:</label>
                  <input
                    type="text"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    placeholder="Type email and press comma or enter (max 5)"
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={handleSendInviteEmail}
                    disabled={inviteSending || !inviteEmails.trim()}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {inviteSending ? "Sending..." : "Send Invite"}
                  </button>
                  {inviteSentMessage && (
                    <p className="text-sm text-green-600">{inviteSentMessage}</p>
                  )}
                </div>
              </div>
              )}
            </div>
            <div className="flex items-center justify-end p-5 border-t border-border">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Channel?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Channel ID: <span className="font-mono text-gray-900">{showDeleteConfirm}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove this channel from your Network. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChannel(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel Detail Modal (when clicking Valid token) */}
      {showChannelDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Token Valid</h3>
                  <p className="text-xs text-green-600 font-medium">Channel is authorized and active</p>
                </div>
              </div>
              <button
                onClick={() => { setShowChannelDetail(null); setChannelDetailData(null); }}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {channelDetailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-500">Loading channel data...</span>
              </div>
            ) : channelDetailData ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Token validated successfully</span>
                  </div>
                  {channelDetailData.tokenUpdatedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Last validated: {new Date(channelDetailData.tokenUpdatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Channel Data</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Channel ID</span>
                      <span className="font-mono text-gray-900">{showChannelDetail}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Channel Name</span>
                      <span className="text-gray-900 font-medium">{channelDetailData.channelTitle}</span>
                    </div>
                    <div className="border-t border-gray-100 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subscribers</span>
                      <span className="text-gray-900 font-semibold">{formatNumber(channelDetailData.subscribers || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Views</span>
                      <span className="text-gray-900 font-semibold">{formatNumber(channelDetailData.views || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Videos</span>
                      <span className="text-gray-900 font-semibold">{(channelDetailData.videos || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="text-gray-900 font-semibold">${(channelDetailData.revenue || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Data is fetched using the channel&apos;s OAuth token. Revenue data requires YouTube Analytics API access.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load channel details.
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setShowChannelDetail(null); setChannelDetailData(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed-position action menu (renders outside table to avoid overflow clipping) */}
      {activeActionMenu && menuPosition && (() => {
        const channel = pageChannels.find((c) => c.id === activeActionMenu);
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
                onClick={() => { handleGenerateInviteLink(channel.id, channel.name); setActiveActionMenu(null); setMenuPosition(null); }}
                disabled={generatingLink}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
              >
                <Key className="w-4 h-4 text-amber-500" />
                {generatingLink ? "Generating..." : "Generate Invite Link"}
              </button>
              {activeTab === "channels" && !channel.isOwn && (
                <>
                  <button
                    onClick={() => { handleDelink(channel.id); setActiveActionMenu(null); setMenuPosition(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <WifiOff className="w-4 h-4" />
                    Delink Channel
                  </button>
                  <button
                    onClick={() => { handleTransfer(channel.id); setActiveActionMenu(null); setMenuPosition(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer Channel
                  </button>
                </>
              )}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => { setShowDeleteConfirm(channel.id); setActiveActionMenu(null); setMenuPosition(null); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Channel
              </button>
              {activeTab === "transferred" && (
                <button
                  onClick={() => { handleRelink(channel.id); setActiveActionMenu(null); setMenuPosition(null); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Relink Channel
                </button>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

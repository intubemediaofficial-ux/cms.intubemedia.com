"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Play,
  ThumbsUp,
  MessageSquare,
  Download,
  Eye,
  Loader2,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { formatNumber } from "@/lib/utils";

const CHANNELS_STORAGE_KEY = "bainsla_channels";

interface StoredChannel {
  id: string;
  status: "active" | "delinked" | "transferred";
}

interface VideoItem {
  id?: string | null;
  snippet?: {
    title?: string | null;
    publishedAt?: string | null;
    thumbnails?: {
      medium?: { url?: string | null } | null;
      default?: { url?: string | null } | null;
    } | null;
  } | null;
  statistics?: {
    viewCount?: string | null;
    likeCount?: string | null;
    commentCount?: string | null;
  } | null;
  contentDetails?: {
    duration?: string | null;
  } | null;
  status?: {
    privacyStatus?: string | null;
  } | null;
}

function parseDuration(isoDuration: string | null | undefined): string {
  if (!isoDuration) return "-";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "-";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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

export default function VideosPage() {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated" && !!session?.accessToken;

  const [activeChannelIds, setActiveChannelIds] = useState<string[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    setActiveChannelIds(getActiveChannelIds());
  }, []);

  const fetchVideos = useCallback(async () => {
    if (!isAuthenticated || activeChannelIds.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const allVideos: VideoItem[] = [];
    for (const channelId of activeChannelIds) {
      try {
        const res = await fetch(`/api/youtube?action=videos&channelId=${encodeURIComponent(channelId)}`);
        const json = await res.json();
        if (res.ok && json.data) {
          allVideos.push(...json.data);
        }
      } catch {
        // continue with other channels
      }
    }
    if (allVideos.length > 0) {
      setVideos(allVideos);
      setIsReal(true);
    } else {
      setError("No videos found for added channels");
    }
    setLoading(false);
  }, [isAuthenticated, activeChannelIds]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const hasNoChannelsAdded = activeChannelIds.length === 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "public" | "private" | "unlisted">("all");

  const filteredVideos = (isReal ? videos : []).filter((video) => {
    const title = video.snippet?.title || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const privacy = video.status?.privacyStatus || "public";
    const matchesStatus = statusFilter === "all" || privacy === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = loading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="text-sm text-muted mt-1">
            Your YouTube videos and their performance.
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <WifiOff className="w-10 h-10 text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Data</h3>
            <p className="text-sm text-muted mb-4">Sign in with Google to see your videos</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/videos" })}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && hasNoChannelsAdded && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Channels Added</h3>
            <p className="text-sm text-muted mb-4">
              Videos sirf added channels ki dikhti hain. Pehle Channels section mein channels add karo.
            </p>
            <a
              href="/channels"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors inline-block"
            >
              Go to Channels
            </a>
          </div>
        </div>
      )}

      {isAuthenticated && !hasNoChannelsAdded && isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted">Loading videos from {activeChannelIds.length} channel{activeChannelIds.length !== 1 ? "s" : ""}...</p>
          </div>
        </div>
      )}

      {isAuthenticated && !hasNoChannelsAdded && !isLoading && !isReal && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Could Not Load Videos</h3>
            <p className="text-sm text-muted mb-4">{error || "Try re-authenticating."}</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/videos" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Re-authenticate
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && !hasNoChannelsAdded && !isLoading && isReal && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "public" | "private" | "unlisted")
                }
                className="border border-border rounded-lg px-3 py-2 text-sm text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Status</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
              <button className="flex items-center gap-2 border border-border px-3 py-2 rounded-lg text-sm text-muted hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="flex items-center gap-2 border border-border px-3 py-2 rounded-lg text-sm text-muted hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted">
              {videos.length === 0 ? "No videos found on your channel" : "No videos match your search"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Video
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Views
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map((video) => {
                    const thumbnail = video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || "";
                    const privacy = video.status?.privacyStatus || "public";
                    const publishedDate = video.snippet?.publishedAt
                      ? new Date(video.snippet.publishedAt).toLocaleDateString()
                      : "-";

                    return (
                      <tr
                        key={video.id}
                        className="border-b border-border/50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                              {thumbnail && (
                                <img
                                  src={thumbnail}
                                  alt={video.snippet?.title || ""}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                                {video.snippet?.title || "Untitled"}
                              </p>
                              <p className="text-xs text-muted mt-0.5">
                                {publishedDate}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              privacy === "public"
                                ? "bg-green-100 text-green-700"
                                : privacy === "private"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {privacy}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-foreground flex items-center justify-end gap-1">
                            <Eye className="w-3.5 h-3.5 text-muted" />
                            {formatNumber(Number(video.statistics?.viewCount || 0))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-foreground flex items-center justify-end gap-1">
                            <ThumbsUp className="w-3.5 h-3.5 text-muted" />
                            {formatNumber(Number(video.statistics?.likeCount || 0))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-foreground flex items-center justify-end gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-muted" />
                            {formatNumber(Number(video.statistics?.commentCount || 0))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-muted">
                            {parseDuration(video.contentDetails?.duration)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                          >
                            <Play className="w-4 h-4 text-muted" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted">
              Showing {filteredVideos.length} of {videos.length} videos
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

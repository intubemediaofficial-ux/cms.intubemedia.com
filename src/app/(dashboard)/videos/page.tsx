"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Play,
  ThumbsUp,
  MessageSquare,
  MoreVertical,
  Download,
  Eye,
} from "lucide-react";
import { topVideos } from "@/lib/mock-data";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filteredVideos = topVideos.filter((video) => {
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="text-sm text-muted mt-1">
            Manage your YouTube videos and track performance.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Upload Video
        </button>
      </div>

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
                setStatusFilter(e.target.value as "all" | "published" | "draft")
              }
              className="border border-border rounded-lg px-3 py-2 text-sm text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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
                  Revenue
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
              {filteredVideos.map((video) => (
                <tr
                  key={video.id}
                  className="border-b border-border/50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                          {video.title}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {video.publishedAt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {video.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-foreground flex items-center justify-end gap-1">
                      <Eye className="w-3.5 h-3.5 text-muted" />
                      {formatNumber(video.views)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-foreground flex items-center justify-end gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-muted" />
                      {formatNumber(video.likes)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-foreground flex items-center justify-end gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-muted" />
                      {formatNumber(video.comments)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-success">
                      {formatCurrency(video.revenue)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-muted">{video.duration}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted">
            Showing {filteredVideos.length} of {topVideos.length} videos
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-border rounded-lg text-sm text-muted hover:bg-slate-50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-border rounded-lg text-sm text-muted hover:bg-slate-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Plus, ExternalLink, Radio, Eye, Video, Users } from "lucide-react";
import { channels } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Channels</h1>
          <p className="text-sm text-muted mt-1">
            Manage your YouTube channels and monitor their performance.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 shrink-0">
                <img
                  src={channel.thumbnail}
                  alt={channel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {channel.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      channel.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {channel.status}
                  </span>
                </div>
                <p className="text-sm text-muted mt-0.5">{channel.handle}</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4 text-muted" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatNumber(channel.subscribers)}
                </p>
                <p className="text-xs text-muted">Subscribers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatNumber(channel.videos)}
                </p>
                <p className="text-xs text-muted">Videos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted mb-1">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatNumber(channel.views)}
                </p>
                <p className="text-xs text-muted">Views</p>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button className="flex-1 text-sm font-medium text-accent border border-accent/30 hover:bg-accent/5 py-2 rounded-lg transition-colors">
                View Analytics
              </button>
              <button className="flex-1 text-sm font-medium text-foreground border border-border hover:bg-slate-50 py-2 rounded-lg transition-colors">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  MoreVertical,
  Video,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckSquare,
  Square,
  ChevronDown,
  Upload,
  Shield,
  MonitorPlay,
} from "lucide-react";

type TabType = "uploads" | "live";

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  views: string;
  likes: string;
  comments: string;
  publishDate: string;
  duration: string;
  contentId: boolean;
  claimStatus: "none" | "active" | "potential" | "disputed";
  monetized: boolean;
  visibility: "public" | "private" | "unlisted";
}

const mockVideos: VideoItem[] = [
  { id: "1", title: "Tere Bina - Official Music Video", channel: "Bainsla Music", thumbnail: "", views: "1.2M", likes: "45K", comments: "2.3K", publishDate: "2024-12-15", duration: "4:32", contentId: true, claimStatus: "active", monetized: true, visibility: "public" },
  { id: "2", title: "Sada Punjab - Full Song", channel: "Desi Beats", thumbnail: "", views: "856K", likes: "32K", comments: "1.8K", publishDate: "2024-11-20", duration: "5:15", contentId: true, claimStatus: "potential", monetized: true, visibility: "public" },
  { id: "3", title: "Nachdi Jawani - Lyrical", channel: "Bainsla Music", thumbnail: "", views: "2.1M", likes: "78K", comments: "4.5K", publishDate: "2024-10-05", duration: "3:48", contentId: true, claimStatus: "none", monetized: true, visibility: "public" },
  { id: "4", title: "Dil Da Mamla - Audio", channel: "Music Hub", thumbnail: "", views: "345K", likes: "12K", comments: "890", publishDate: "2024-09-18", duration: "4:05", contentId: false, claimStatus: "none", monetized: false, visibility: "unlisted" },
  { id: "5", title: "Punjab Di Shan - Remix", channel: "Desi Beats", thumbnail: "", views: "567K", likes: "21K", comments: "1.1K", publishDate: "2024-08-22", duration: "3:22", contentId: true, claimStatus: "disputed", monetized: true, visibility: "public" },
  { id: "6", title: "Ishq Tera - Unplugged", channel: "Bainsla Music", thumbnail: "", views: "189K", likes: "8.5K", comments: "456", publishDate: "2024-07-30", duration: "5:48", contentId: true, claimStatus: "active", monetized: true, visibility: "public" },
];

const mockLiveStreams: VideoItem[] = [
  { id: "l1", title: "Live Concert - Bainsla Night 2024", channel: "Bainsla Music", thumbnail: "", views: "45K", likes: "3.2K", comments: "890", publishDate: "2024-12-31", duration: "2:30:00", contentId: false, claimStatus: "none", monetized: true, visibility: "public" },
  { id: "l2", title: "Music Launch Event Live", channel: "Bainsla Music", thumbnail: "", views: "12K", likes: "1.1K", comments: "234", publishDate: "2024-11-15", duration: "1:45:00", contentId: false, claimStatus: "none", monetized: false, visibility: "public" },
];

function getClaimBadge(status: VideoItem["claimStatus"]) {
  switch (status) {
    case "active": return <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">Active claim</span>;
    case "potential": return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">Potential</span>;
    case "disputed": return <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full">Disputed</span>;
    default: return null;
  }
}

export default function CmsVideosPage() {
  const [activeTab, setActiveTab] = useState<TabType>("uploads");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const videos = activeTab === "uploads" ? mockVideos : mockLiveStreams;
  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(filteredVideos.map((v) => v.id)));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Videos</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-4">
        <button
          onClick={() => { setActiveTab("uploads"); setSelectedVideos(new Set()); }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "uploads" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Uploads
        </button>
        <button
          onClick={() => { setActiveTab("live"); setSelectedVideos(new Set()); }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "live" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Live
        </button>
        <button
          className="pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
        >
          Rights Management
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center gap-3 p-3">
          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>

          {/* Filter */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className="w-3 h-3" />
          </button>

          <div className="flex-1" />

          {/* Bulk actions */}
          {selectedVideos.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedVideos.size} selected</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Shield className="w-3.5 h-3.5" /> Content ID
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}

          {selectedVideos.size === 0 && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="px-3 pb-3 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap gap-3">
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-600">
                <option>All channels</option>
                <option>Bainsla Music</option>
                <option>Desi Beats</option>
                <option>Music Hub</option>
              </select>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-600">
                <option>Claim status</option>
                <option>Active claim</option>
                <option>Potential</option>
                <option>Disputed</option>
                <option>No claim</option>
              </select>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-600">
                <option>Visibility</option>
                <option>Public</option>
                <option>Private</option>
                <option>Unlisted</option>
              </select>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-600">
                <option>Content ID</option>
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-600">
                <option>Monetization</option>
                <option>Monetized</option>
                <option>Not monetized</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Video list table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-4 py-3">
                <button onClick={toggleSelectAll}>
                  {selectedVideos.size === filteredVideos.length && filteredVideos.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Video</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Channel</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Visibility</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Views</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Claims</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Content ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.map((video) => (
              <tr key={video.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => toggleSelect(video.id)}>
                    {selectedVideos.has(video.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[120px] h-[68px] bg-gray-200 rounded flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{video.likes}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{video.channel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium capitalize ${
                    video.visibility === "public" ? "text-green-600" : video.visibility === "private" ? "text-red-600" : "text-gray-500"
                  }`}>
                    {video.visibility}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">{video.views}</td>
                <td className="px-4 py-3">{getClaimBadge(video.claimStatus)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${video.contentId ? "text-green-600" : "text-gray-400"}`}>
                    {video.contentId ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{video.publishDate}</td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

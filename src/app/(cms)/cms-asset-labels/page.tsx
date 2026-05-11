"use client";

import { useState } from "react";
import { Plus, Search, Tags, Edit3, Trash2, MoreVertical, FileVideo, ChevronRight } from "lucide-react";

interface AssetLabel {
  id: string;
  name: string;
  description: string;
  assetsCount: number;
  activeClaimsCount: number;
  createdDate: string;
  updatedDate: string;
}

const mockLabels: AssetLabel[] = [
  { id: "L1", name: "Punjabi Hits 2024", description: "All Punjabi music releases for 2024", assetsCount: 45, activeClaimsCount: 120, createdDate: "2024-01-01", updatedDate: "2024-12-15" },
  { id: "L2", name: "Bollywood Originals", description: "Original Bollywood soundtracks", assetsCount: 28, activeClaimsCount: 85, createdDate: "2024-02-15", updatedDate: "2024-11-20" },
  { id: "L3", name: "Remix Collection", description: "All remix and mashup tracks", assetsCount: 15, activeClaimsCount: 32, createdDate: "2024-03-10", updatedDate: "2024-10-05" },
  { id: "L4", name: "Classical Archive", description: "Classical music and bhajans", assetsCount: 60, activeClaimsCount: 45, createdDate: "2024-04-01", updatedDate: "2024-09-18" },
  { id: "L5", name: "Bainsla Exclusives", description: "Exclusive Bainsla Music releases", assetsCount: 22, activeClaimsCount: 67, createdDate: "2024-05-20", updatedDate: "2024-12-01" },
];

export default function CmsAssetLabelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelDesc, setNewLabelDesc] = useState("");

  const filteredLabels = mockLabels.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Asset labels</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create label
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center gap-3 p-3">
          <div className="flex items-center bg-gray-100 rounded-lg flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Search labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Labels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabels.map((label) => (
          <div key={label.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-800">{label.name}</h3>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">{label.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-semibold text-gray-800">{label.assetsCount}</p>
                <p className="text-xs text-gray-500">Assets</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{label.activeClaimsCount}</p>
                <p className="text-xs text-gray-500">Active claims</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Updated {label.updatedDate}</span>
              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View claims <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Label Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Create new label</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label name</label>
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter label name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newLabelDesc}
                  onChange={(e) => setNewLabelDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Describe this label"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Create label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

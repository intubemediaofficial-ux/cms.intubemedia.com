"use client";

import { useState } from "react";
import { Upload, Download, FileText, Package, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, MoreVertical, FolderOpen } from "lucide-react";

type PackageStatus = "completed" | "processing" | "failed" | "validating";

interface ContentPackage {
  id: string;
  name: string;
  type: "spreadsheet" | "ddex" | "media";
  assets: number;
  status: PackageStatus;
  uploadedBy: string;
  uploadDate: string;
  errors: number;
  warnings: number;
}

interface BulkAction {
  id: string;
  action: string;
  scope: string;
  itemsAffected: number;
  status: "completed" | "in_progress" | "failed";
  executedBy: string;
  executedDate: string;
}

const mockPackages: ContentPackage[] = [
  { id: "PK1", name: "Punjabi_Hits_2024.csv", type: "spreadsheet", assets: 25, status: "completed", uploadedBy: "Admin", uploadDate: "2024-12-20", errors: 0, warnings: 2 },
  { id: "PK2", name: "New_Releases_Jan.csv", type: "spreadsheet", assets: 10, status: "processing", uploadedBy: "Manager", uploadDate: "2024-12-22", errors: 0, warnings: 0 },
  { id: "PK3", name: "Classical_Archive_Update.ddex", type: "ddex", assets: 60, status: "completed", uploadedBy: "Admin", uploadDate: "2024-12-15", errors: 0, warnings: 5 },
  { id: "PK4", name: "Remix_Collection_v2.csv", type: "spreadsheet", assets: 15, status: "failed", uploadedBy: "Editor", uploadDate: "2024-12-18", errors: 3, warnings: 0 },
  { id: "PK5", name: "Bainsla_Exclusives.csv", type: "spreadsheet", assets: 8, status: "validating", uploadedBy: "Admin", uploadDate: "2024-12-23", errors: 0, warnings: 0 },
];

const mockBulkActions: BulkAction[] = [
  { id: "BA1", action: "Update ownership", scope: "Assets", itemsAffected: 45, status: "completed", executedBy: "Admin", executedDate: "2024-12-20" },
  { id: "BA2", action: "Apply match policy", scope: "Assets", itemsAffected: 120, status: "completed", executedBy: "Admin", executedDate: "2024-12-19" },
  { id: "BA3", action: "Release claims", scope: "Claimed videos", itemsAffected: 15, status: "completed", executedBy: "Manager", executedDate: "2024-12-18" },
  { id: "BA4", action: "Update channel permissions", scope: "Channels", itemsAffected: 3, status: "in_progress", executedBy: "Admin", executedDate: "2024-12-23" },
];

function getPackageStatusBadge(status: PackageStatus) {
  switch (status) {
    case "completed": return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" /> Completed</span>;
    case "processing": return <span className="flex items-center gap-1 text-xs text-blue-600"><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>;
    case "failed": return <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="w-3 h-3" /> Failed</span>;
    case "validating": return <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="w-3 h-3" /> Validating</span>;
  }
}

export default function CmsContentUpdatesPage() {
  const [activeTab, setActiveTab] = useState<"packages" | "bulk-actions" | "templates">("packages");
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Content Updates</h1>
        <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          <Upload className="w-4 h-4" /> Upload package
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        {([
          { value: "packages" as const, label: "My packages" },
          { value: "bulk-actions" as const, label: "Bulk actions" },
          { value: "templates" as const, label: "Templates" },
        ]).map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.value ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Packages Tab */}
      {activeTab === "packages" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Package</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Type</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Assets</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Issues</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Uploaded by</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {mockPackages.map(pkg => (
                <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{pkg.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{pkg.assets}</td>
                  <td className="px-4 py-3">{getPackageStatusBadge(pkg.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {pkg.errors > 0 && <span className="text-xs text-red-600">{pkg.errors} errors</span>}
                      {pkg.warnings > 0 && <span className="text-xs text-yellow-600">{pkg.warnings} warnings</span>}
                      {pkg.errors === 0 && pkg.warnings === 0 && <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{pkg.uploadedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{pkg.uploadDate}</td>
                  <td className="px-4 py-3"><button className="p-1 hover:bg-gray-100 rounded"><MoreVertical className="w-4 h-4 text-gray-400" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Actions Tab */}
      {activeTab === "bulk-actions" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Action</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Scope</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Items</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Executed by</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockBulkActions.map(action => (
                <tr key={action.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{action.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{action.scope}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{action.itemsAffected}</td>
                  <td className="px-4 py-3">
                    {action.status === "completed" && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" /> Completed</span>}
                    {action.status === "in_progress" && <span className="flex items-center gap-1 text-xs text-blue-600"><RefreshCw className="w-3 h-3 animate-spin" /> In progress</span>}
                    {action.status === "failed" && <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="w-3 h-3" /> Failed</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{action.executedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{action.executedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Sound Recording Template", desc: "CSV template for uploading sound recordings", format: "CSV" },
            { name: "Music Video Template", desc: "CSV template for uploading music videos", format: "CSV" },
            { name: "Composition Template", desc: "CSV template for uploading compositions", format: "CSV" },
            { name: "Asset Update Template", desc: "CSV template for bulk updating asset metadata", format: "CSV" },
            { name: "Ownership Template", desc: "CSV template for updating ownership data", format: "CSV" },
            { name: "DDEX Template", desc: "DDEX format template for bulk delivery", format: "DDEX" },
          ].map(t => (
            <div key={t.name} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-800">{t.name}</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">{t.desc}</p>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                <Download className="w-3 h-3" /> Download {t.format}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Upload content package</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Drag and drop files here</p>
              <p className="text-xs text-gray-400 mb-3">or</p>
              <button className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Select files</button>
              <p className="text-xs text-gray-400 mt-3">Upload a metadata file (CSV or DDEX) along with media files</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Process package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

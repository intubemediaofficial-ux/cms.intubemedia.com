"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Download,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { downloadExcel, downloadMultiSheetExcel } from "@/lib/excel-export";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Vendor {
  id: string;
  name: string;
  channelCount: number;
}

interface ReportChannel {
  channel_id: string;
  channel_name: string;
  client_name: string;
  network_name: string;
  revenue_usd: number;
  views: number;
  synced_through: string | null;
  available: boolean;
}

interface VendorReport {
  month: string;
  vendor: Vendor;
  channels: ReportChannel[];
  totals: {
    channels: number;
    revenue_usd: number;
    views: number;
  };
  cacheStatus: "hit" | "updated" | "partial";
  missingChannels: number;
}

function monthOptions(): Array<{ value: string; label: string }> {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", { month: "long", year: "numeric" }),
    };
  });
}

export function VendorManagementPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const months = useMemo(() => monthOptions(), []);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(months[0]?.value || "");
  const [report, setReport] = useState<VendorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [sheetConfiguring, setSheetConfiguring] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetCredentials, setSheetCredentials] = useState<File | null>(null);
  const [sheetStatus, setSheetStatus] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [error, setError] = useState("");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/vendors?action=list", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to load vendors");
      const list: Vendor[] = json.data?.vendors || [];
      setVendors(list);
      setSelectedVendorId((current) =>
        list.some((vendor) => vendor.id === current) ? current : list[0]?.id || ""
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      queueMicrotask(() => void fetchVendors());
    }
  }, [status, fetchVendors]);

  const fetchReport = useCallback(async () => {
    if (!selectedVendorId || !selectedMonth) {
      setReport(null);
      return;
    }
    setReportLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/vendors?action=report&vendorId=${encodeURIComponent(selectedVendorId)}&month=${selectedMonth}`,
        { cache: "no-store" }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to load vendor report");
      setReport(json.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load report");
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  }, [selectedVendorId, selectedMonth]);

  useEffect(() => {
    queueMicrotask(() => void fetchReport());
  }, [fetchReport]);

  const createVendor = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to create vendor");
      setNewName("");
      await fetchVendors();
      setSelectedVendorId(json.data.id);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create vendor");
    } finally {
      setSaving(false);
    }
  };

  const renameVendor = async () => {
    const name = editingName.trim();
    if (!selectedVendorId || !name) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", vendorId: selectedVendorId, name }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to rename vendor");
      setEditingName("");
      await fetchVendors();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to rename vendor");
    } finally {
      setSaving(false);
    }
  };

  const deleteVendor = async () => {
    const selected = vendors.find((vendor) => vendor.id === selectedVendorId);
    if (!selected || !window.confirm(`Delete vendor “${selected.name}” and clear its assignments?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/vendors?vendorId=${encodeURIComponent(selected.id)}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to delete vendor");
      setReport(null);
      await fetchVendors();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to delete vendor");
    } finally {
      setSaving(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    const monthLabel = months.find((month) => month.value === report.month)?.label || report.month;
    downloadExcel(
      ["Month", "Vendor", "Client", "Channel", "Channel ID", "Network", "Views", "Revenue USD", "Status"],
      report.channels.map((channel) => [
        monthLabel,
        report.vendor.name,
        channel.client_name,
        channel.channel_name,
        channel.channel_id,
        channel.network_name,
        channel.views,
        Number(channel.revenue_usd.toFixed(3)),
        channel.available ? "Available" : "Pending",
      ]),
      `${report.vendor.name.replace(/[^a-z0-9]+/gi, "-")}-${report.month}-vendor-report`,
      "Vendor Report"
    );
  };

  const exportAllVendors = async () => {
    if (!selectedMonth) return;
    setExportingAll(true);
    setError("");
    try {
      const response = await fetch(`/api/vendors?action=reports&month=${selectedMonth}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to load all vendor reports");
      const reports: VendorReport[] = json.data?.reports || [];
      const monthLabel = months.find((month) => month.value === selectedMonth)?.label || selectedMonth;
      downloadMultiSheetExcel(
        [
          {
            name: "Vendor Summary",
            headers: ["Month", "Vendor", "Channels", "Views", "Revenue USD", "Pending Channels"],
            rows: reports.map((item) => [
              monthLabel,
              item.vendor.name,
              item.totals.channels,
              item.totals.views,
              Number(item.totals.revenue_usd.toFixed(3)),
              item.missingChannels,
            ]),
          },
          ...reports.map((item) => ({
            name: item.vendor.name,
            headers: ["Month", "Vendor", "Client", "Channel", "Channel ID", "Network", "Views", "Revenue USD", "Status"],
            rows: item.channels.map((channel) => [
              monthLabel,
              item.vendor.name,
              channel.client_name,
              channel.channel_name,
              channel.channel_id,
              channel.network_name,
              channel.views,
              Number(channel.revenue_usd.toFixed(3)),
              channel.available ? "Available" : "Pending",
            ]),
          })),
        ],
        `all-vendors-${selectedMonth}-report`
      );
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export vendor reports");
    } finally {
      setExportingAll(false);
    }
  };

  const syncGoogleSheet = async () => {
    setSheetSyncing(true);
    setSheetStatus("");
    setError("");
    try {
      const response = await fetch("/api/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "syncSheet" }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Google Sheets sync failed");
      setSheetStatus(
        json.data?.status === "not_configured"
          ? "Google Sheet is not configured yet."
          : `Google Sheet updated: ${json.data?.vendors || 0} vendors, ${json.data?.rows || 0} rows.`
      );
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Google Sheets sync failed");
    } finally {
      setSheetSyncing(false);
    }
  };

  const configureGoogleSheet = async () => {
    if (!sheetUrl.trim() || !sheetCredentials) {
      setError("Google Sheet URL and service-account JSON are required");
      return;
    }
    setSheetConfiguring(true);
    setSheetStatus("");
    setError("");
    try {
      const credentials = JSON.parse(await sheetCredentials.text()) as {
        client_email?: unknown;
        private_key?: unknown;
      };
      if (
        typeof credentials.client_email !== "string" ||
        typeof credentials.private_key !== "string"
      ) {
        throw new Error("Invalid service-account JSON file");
      }
      const response = await fetch("/api/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "configureSheet",
          spreadsheetId: sheetUrl,
          clientEmail: credentials.client_email,
          privateKey: credentials.private_key,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Google Sheet configuration failed");
      setSheetStatus(
        `Google Sheet configured and updated: ${json.data?.vendors || 0} vendors, ${json.data?.rows || 0} rows.`
      );
      setSheetCredentials(null);
    } catch (configError) {
      setError(
        configError instanceof Error ? configError.message : "Google Sheet configuration failed"
      );
    } finally {
      setSheetConfiguring(false);
    }
  };

  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId);
  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(vendorSearch.trim().toLowerCase())
  );
  const filteredChannels = (report?.channels || []).filter((channel) => {
    const query = channelSearch.trim().toLowerCase();
    return !query ||
      channel.channel_name.toLowerCase().includes(query) ||
      channel.channel_id.toLowerCase().includes(query) ||
      channel.client_name.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-sm text-muted mt-1">Assign channels and review exact calendar-month revenue and views.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              onClick={() => void syncGoogleSheet()}
              disabled={sheetSyncing}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm disabled:opacity-50"
            >
              {sheetSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync Google Sheet
            </button>
          )}
          <button
            onClick={() => void exportAllVendors()}
            disabled={exportingAll || vendors.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {exportingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            All Vendors Excel
          </button>
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void createVendor()}
            placeholder="New vendor name"
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
          <button
            onClick={createVendor}
            disabled={saving || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {sheetStatus && <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">{sheetStatus}</div>}

      {isAdmin && (
        <div className="bg-white border border-border rounded-xl p-4 space-y-3">
          <div>
            <h2 className="font-semibold">Google Sheet Connection</h2>
            <p className="text-xs text-muted mt-1">
              Admin-only setup. Credentials are encrypted server-side and never displayed again.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              type="url"
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
              placeholder="Google Sheet URL"
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => setSheetCredentials(event.target.files?.[0] || null)}
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
            <button
              onClick={() => void configureGoogleSheet()}
              disabled={sheetConfiguring || !sheetUrl.trim() || !sheetCredentials}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50"
            >
              {sheetConfiguring && <Loader2 className="w-4 h-4 animate-spin" />}
              Save & Sync
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <div className="font-semibold">Vendors ({vendors.length})</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                value={vendorSearch}
                onChange={(event) => setVendorSearch(event.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-sm text-muted text-center">No vendors added yet.</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-8 text-sm text-muted text-center">No vendors match your search.</div>
          ) : (
            <div className="divide-y divide-border max-h-[640px] overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendorId(vendor.id)}
                  className={`w-full p-4 text-left flex items-center gap-3 ${selectedVendorId === vendor.id ? "bg-primary/5" : "hover:bg-slate-50"}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{vendor.name}</p>
                    <p className="text-xs text-muted">{vendor.channelCount} active channels</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedVendor ? (
            <>
              <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedVendor.name}</h2>
                  <p className="text-xs text-muted">Only currently assigned active channels are included.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    {months.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
                  </select>
                  <button onClick={fetchReport} className="p-2 border border-border rounded-lg" title="Refresh report">
                    <RefreshCw className={`w-4 h-4 ${reportLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => setEditingName(selectedVendor.name)}
                    className="p-2 border border-border rounded-lg"
                    title="Rename vendor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={deleteVendor} className="p-2 border border-red-200 text-red-600 rounded-lg" title="Delete vendor">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportReport}
                    disabled={!report || report.channels.length === 0}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>

              {editingName && (
                <div className="bg-white border border-border rounded-xl p-4 flex gap-2">
                  <input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="flex-1 px-3 py-2 border border-border rounded-lg text-sm" />
                  <button onClick={renameVendor} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditingName("")} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
                </div>
              )}

              <div className="bg-white border border-border rounded-xl p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    value={channelSearch}
                    onChange={(event) => setChannelSearch(event.target.value)}
                    placeholder="Search channel name, full ID, or client..."
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
              </div>

              {reportLoading ? (
                <div className="bg-white border border-border rounded-xl p-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : report ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-border rounded-xl p-5"><p className="text-xs text-muted uppercase">Channels</p><p className="text-2xl font-bold mt-1">{report.totals.channels}</p></div>
                    <div className="bg-white border border-border rounded-xl p-5"><p className="text-xs text-muted uppercase">Revenue</p><p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(report.totals.revenue_usd)}</p></div>
                    <div className="bg-white border border-border rounded-xl p-5"><p className="text-xs text-muted uppercase">Views</p><p className="text-2xl font-bold text-blue-600 mt-1">{formatNumber(report.totals.views)}</p></div>
                  </div>
                  <div className="bg-white border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 border-b border-border"><th className="text-left px-4 py-3">Channel</th><th className="text-left px-4 py-3">Client</th><th className="text-left px-4 py-3">Vendor</th><th className="text-left px-4 py-3">Network</th><th className="text-left px-4 py-3">Month</th><th className="text-right px-4 py-3">Views</th><th className="text-right px-4 py-3">Revenue</th><th className="text-right px-4 py-3">Status</th></tr></thead>
                        <tbody>
                          {filteredChannels.map((channel) => (
                            <tr key={channel.channel_id} className="border-b border-border last:border-0 hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <a href={`https://www.youtube.com/channel/${channel.channel_id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{channel.channel_name}</a>
                                <p className="text-xs text-muted font-mono whitespace-nowrap">{channel.channel_id}</p>
                              </td>
                              <td className="px-4 py-3">{channel.client_name || "—"}</td>
                              <td className="px-4 py-3">{report.vendor.name}</td>
                              <td className="px-4 py-3">{channel.network_name || "—"}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{months.find((month) => month.value === report.month)?.label || report.month}</td>
                              <td className="px-4 py-3 text-right">{formatNumber(channel.views)}</td>
                              <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(channel.revenue_usd)}</td>
                              <td className="px-4 py-3 text-right"><span className={`text-xs px-2 py-1 rounded-full ${channel.available ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{channel.available ? "Cached" : "Pending"}</span></td>
                            </tr>
                          ))}
                          {filteredChannels.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">No channels match this vendor and search.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="bg-white border border-border rounded-xl p-16 text-center text-muted">Add or select a vendor to view its report.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorManagementPage;

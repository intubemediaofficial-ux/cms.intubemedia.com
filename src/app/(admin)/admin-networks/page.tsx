"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  X,
  Loader2,
  Shield,
  Edit2,
  Trash2,
  Globe,
  Percent,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Network {
  id: string;
  name: string;
  revenueSharePercent: number;
  createdDate: string;
}

export default function AdminNetworksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [formName, setFormName] = useState("");
  const [formRevShare, setFormRevShare] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchNetworks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/networks");
      if (res.ok) {
        const json = await res.json();
        setNetworks(json.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchNetworks();
    }
  }, [status, session, fetchNetworks]);

  const openCreate = () => {
    setEditingNetwork(null);
    setFormName("");
    setFormRevShare("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (network: Network) => {
    setEditingNetwork(network);
    setFormName(network.name);
    setFormRevShare(String(network.revenueSharePercent));
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError("Network name is required");
      return;
    }
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        ...(editingNetwork ? { id: editingNetwork.id } : {}),
        name: formName.trim(),
        revenueSharePercent: Number(formRevShare) || 0,
      };

      const res = await fetch("/api/networks", {
        method: editingNetwork ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to save");
        return;
      }

      setShowModal(false);
      fetchNetworks();
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/networks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchNetworks();
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const filtered = networks.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted">Loading networks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin Panel</span>
        <span>&rsaquo;</span>
        <span className="text-foreground font-medium">Network Management</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Network Management</h1>
          <p className="text-sm text-muted mt-1">Create and manage networks with revenue share settings.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Network
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search networks..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Network Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Revenue Share %</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Created</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((network, idx) => (
                <tr key={network.id} className="border-b border-border hover:bg-slate-50">
                  <td className="px-4 py-3 text-muted">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-foreground">{network.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <Percent className="w-3 h-3" />
                      {network.revenueSharePercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{network.createdDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(network)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => setDeleteId(network.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No networks found. Create one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-slate-50 text-sm text-muted">
          {filtered.length} network{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingNetwork ? "Edit Network" : "Create Network"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Network Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Network Name"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Default Revenue Share %</label>
                <input
                  type="number"
                  value={formRevShare}
                  onChange={(e) => setFormRevShare(e.target.value)}
                  placeholder="e.g. 70"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted mt-1">Network ka default revenue share percentage (per-user override possible)</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-muted hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingNetwork ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Network?</h3>
            <p className="text-sm text-muted mb-4">
              Are you sure? This will remove the network. Users assigned to it won&apos;t be affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-muted hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

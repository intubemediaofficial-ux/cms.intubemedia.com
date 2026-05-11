"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import type { GstClient } from "@/lib/gst-types";
import { INDIAN_STATES } from "@/lib/gst-types";

function ClientForm({
  client,
  onSave,
  onCancel,
}: {
  client?: GstClient;
  onSave: (data: Partial<GstClient> & { action: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: client?.name || "",
    address: client?.address || "",
    city: client?.city || "",
    state: client?.state || "",
    stateCode: client?.stateCode || "",
    pincode: client?.pincode || "",
    gstin: client?.gstin || "",
    pan: client?.pan || "",
    phone: client?.phone || "",
    email: client?.email || "",
  });

  const handleStateChange = (code: string) => {
    setForm((f) => ({ ...f, stateCode: code, state: INDIAN_STATES[code] || "" }));
  };

  const handleGstinChange = (val: string) => {
    const upper = val.toUpperCase();
    setForm((f) => {
      const newForm = { ...f, gstin: upper };
      if (upper.length >= 2) {
        const sc = upper.substring(0, 2);
        if (INDIAN_STATES[sc]) {
          newForm.stateCode = sc;
          newForm.state = INDIAN_STATES[sc];
        }
      }
      if (upper.length >= 12) {
        newForm.pan = upper.substring(2, 12);
      }
      return newForm;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {client ? "Edit Client" : "Add New Client"}
          </h2>
          <button onClick={onCancel} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company / Client Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. ABC Enterprises"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GSTIN *</label>
            <input
              type="text"
              value={form.gstin}
              onChange={(e) => handleGstinChange(e.target.value)}
              maxLength={15}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              placeholder="e.g. 07AABCU9603R1ZM"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select
                value={form.stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select State</option>
                {Object.entries(INDIAN_STATES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PAN</label>
              <input
                type="text"
                value={form.pan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pan: e.target.value.toUpperCase() }))
                }
                maxLength={10}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                placeholder="AABCU9603R"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                maxLength={6}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.name.trim()) return alert("Client name is required");
              onSave({
                action: client ? "update" : "create",
                id: client?.id,
                ...form,
              });
            }}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            {client ? "Update" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GstClientsPage() {
  const [clients, setClients] = useState<GstClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<GstClient | undefined>();

  const fetchRef = useRef(0);
  const fetchClients = () => {
    const id = ++fetchRef.current;
    setLoading(true);
    fetch("/api/gst/clients")
      .then((r) => r.json())
      .then((res) => { if (fetchRef.current === id) setClients(res.data || []); })
      .finally(() => { if (fetchRef.current === id) setLoading(false); });
  };

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetchClients();
  }, []);

  const handleSave = async (data: Partial<GstClient> & { action: string }) => {
    await fetch("/api/gst/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setEditClient(undefined);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    await fetch("/api/gst/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchClients();
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted mt-1">Manage your GST clients</p>
        </div>
        <button
          onClick={() => {
            setEditClient(undefined);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            {search ? "No clients match your search" : "No clients added yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-sm">{client.name}</td>
                    <td className="px-4 py-3 text-sm font-mono">{client.gstin}</td>
                    <td className="px-4 py-3 text-sm">{client.state}</td>
                    <td className="px-4 py-3 text-sm">{client.city}</td>
                    <td className="px-4 py-3 text-sm">{client.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditClient(client);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ClientForm
          client={editClient}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditClient(undefined);
          }}
        />
      )}
    </div>
  );
}

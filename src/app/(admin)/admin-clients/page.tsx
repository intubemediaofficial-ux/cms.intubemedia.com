"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Loader2,
  RotateCcw,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  channels: string[];
  status: "active" | "inactive";
  joinedDate: string;
  category: string;
}

const CLIENTS_KEY = "bainsla_admin_clients";
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveClients(clients: Client[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export default function AdminClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCategory, setFormCategory] = useState("Music");
  const [formChannels, setFormChannels] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormCategory("Music");
    setFormChannels("");
    setFormError(null);
    setEditingClient(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormCategory(client.category);
    setFormChannels(client.channels.join(", "));
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveClient = () => {
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and Email are required");
      return;
    }

    const channelIds = formChannels
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (editingClient) {
      const updated = clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              name: formName.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              category: formCategory,
              channels: channelIds,
            }
          : c
      );
      saveClients(updated);
      setClients(updated);
    } else {
      const exists = clients.some(
        (c) => c.email.toLowerCase() === formEmail.trim().toLowerCase()
      );
      if (exists) {
        setFormError("Client with this email already exists");
        return;
      }

      const newClient: Client = {
        id: Date.now().toString(),
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        channels: channelIds,
        status: "active",
        joinedDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        category: formCategory,
      };

      const updated = [...clients, newClient];
      saveClients(updated);
      setClients(updated);
    }

    setShowModal(false);
    resetForm();
  };

  const handleToggleStatus = (clientId: string) => {
    const updated = clients.map((c) =>
      c.id === clientId
        ? { ...c, status: (c.status === "active" ? "inactive" : "active") as "active" | "inactive" }
        : c
    );
    saveClients(updated);
    setClients(updated);
  };

  const handleDeleteClient = (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    const updated = clients.filter((c) => c.id !== clientId);
    saveClients(updated);
    setClients(updated);
  };

  const filteredClients = useMemo(() => {
    let result = clients;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result;
  }, [clients, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredClients.length / perPage);
  const pageClients = filteredClients.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin</span>
        <span>›</span>
        <span className="text-foreground font-medium">Client Management</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="text-sm text-muted mt-1">
            Add, edit, and manage client partners and their channel assignments.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Clients</p>
            <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Active Clients</p>
            <p className="text-2xl font-bold text-green-900">
              {clients.filter((c) => c.status === "active").length}
            </p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Total Channels</p>
            <p className="text-2xl font-bold text-purple-900">
              {clients.reduce((sum, c) => sum + c.channels.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search clients by name, email..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setCurrentPage(1);
            }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground px-3 py-2 border border-border rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <p className="text-sm text-muted">
            Total: <span className="font-semibold text-primary">{filteredClients.length}</span> clients
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Channels</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageClients.map((client) => (
                <tr key={client.id} className="border-b border-border hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {client.name[0]}
                      </div>
                      <span className="font-medium text-foreground">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{client.email}</td>
                  <td className="px-4 py-3 text-muted">{client.phone || "-"}</td>
                  <td className="px-4 py-3 text-foreground">{client.category}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Radio className="w-3.5 h-3.5 text-purple-500" />
                      {client.channels.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(client.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        client.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {client.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{client.joinedDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    No clients found. Click &quot;Add Client&quot; to get started.
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
              Showing {(currentPage - 1) * perPage + 1} to{" "}
              {Math.min(currentPage * perPage, filteredClients.length)} of{" "}
              {filteredClients.length}
            </p>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
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
                className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingClient ? "Edit Client" : "Add New Client"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
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
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Om Worldwide Entertainment"
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="client@email.com"
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="Music">Music</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Devotional">Devotional</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  YouTube Channel IDs
                </label>
                <textarea
                  value={formChannels}
                  onChange={(e) => setFormChannels(e.target.value)}
                  placeholder="UC..., UC... (comma separated channel IDs)"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <p className="text-xs text-muted mt-1">
                  Enter YouTube channel IDs separated by commas
                </p>
              </div>
              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {editingClient ? "Save Changes" : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

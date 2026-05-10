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
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  XCircle,
  DollarSign,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ChannelDetail {
  id: string;
  name: string;
  subscribers: number;
  views: number;
  videos: number;
  thumbnail: string;
  tokenStatus: string;
  revenue?: number;
}

interface ClientRevenueData {
  totalRevenue: number;
  totalViews: number;
  totalSubscribers: number;
  cpm: number;
  rpm: number;
}

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

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function AdminClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [passwordClient, setPasswordClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCategory, setFormCategory] = useState("Music");
  const [formChannels, setFormChannels] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Client detail view state
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [clientChannels, setClientChannels] = useState<ChannelDetail[]>([]);
  const [clientChannelsLoading, setClientChannelsLoading] = useState(false);
  const [clientRevenue, setClientRevenue] = useState<ClientRevenueData | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        setClients(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchClients();
    }
  }, [status, session, fetchClients]);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
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
    setFormPassword("");
    setFormPhone(client.phone);
    setFormCategory(client.category);
    setFormChannels(client.channels.join(", "));
    setFormError(null);
    setShowModal(true);
  };

  const openPasswordModal = (client: Client) => {
    setPasswordClient(client);
    setNewPassword("");
    setShowNewPassword(false);
    setPasswordSuccess(false);
    setShowPasswordModal(true);
  };

  const handleSaveClient = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and Email are required");
      return;
    }
    if (!editingClient && !formPassword.trim()) {
      setFormError("Password is required for new users");
      return;
    }
    if (!editingClient && formPassword.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    const channelIds = formChannels
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    setSaving(true);
    setFormError(null);

    try {
      if (editingClient) {
        const body: Record<string, unknown> = {
          id: editingClient.id,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          category: formCategory,
          channels: channelIds,
        };
        if (formPassword.trim()) {
          body.password = formPassword.trim();
        }

        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to update client");
          return;
        }
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim(),
            password: formPassword.trim(),
            phone: formPhone.trim(),
            category: formCategory,
            channels: channelIds,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to create client");
          return;
        }
      }

      setShowModal(false);
      resetForm();
      fetchClients();
    } catch {
      setFormError("Failed to save client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordClient || !newPassword.trim()) return;
    if (newPassword.length < 6) return;

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: passwordClient.id,
          password: newPassword.trim(),
        }),
      });
      if (res.ok) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordClient(null);
        }, 1500);
      }
    } catch {
      // silent
    } finally {
      setPasswordSaving(false);
    }
  };

  const openClientView = useCallback(async (client: Client) => {
    setViewingClient(client);
    setClientChannels([]);
    setClientRevenue(null);
    setClientChannelsLoading(true);

    try {
      const channelDetails: ChannelDetail[] = [];
      const channelIds = client.channels;

      if (channelIds.length > 0) {
        // Fetch token statuses + channel info + revenue in parallel
        const [tokenRes, revenueRes] = await Promise.all([
          fetch(`/api/channel-tokens?action=bulkTokenStatus&channelIds=${encodeURIComponent(channelIds.join(","))}`),
          fetch(`/api/youtube?action=dashboardFull&channelIds=${encodeURIComponent(channelIds.join(","))}`),
        ]);

        const tokenJson = await tokenRes.json();
        const tokenStatuses = tokenJson.data?.statuses || {};

        // Parse revenue data
        let totalRevenue = 0;
        let totalAnalyticsViews = 0;
        let totalSubs = 0;
        if (revenueRes.ok) {
          const revJson = await revenueRes.json();
          const revData = revJson.data;
          if (revData) {
            // Sum from main revenue
            if (revData.currentRevenue?.rows?.length && revData.currentRevenue?.columnHeaders) {
              const headers = revData.currentRevenue.columnHeaders.map((h: { name?: string | null }) => h.name || "");
              const revIdx = headers.indexOf("estimatedRevenue");
              const viewIdx = headers.indexOf("views");
              if (revIdx !== -1) {
                totalRevenue += revData.currentRevenue.rows.reduce((s: number, r: (string | number)[]) => s + (Number(r[revIdx]) || 0), 0);
              }
              if (viewIdx !== -1) {
                totalAnalyticsViews += revData.currentRevenue.rows.reduce((s: number, r: (string | number)[]) => s + (Number(r[viewIdx]) || 0), 0);
              }
            }
            // Sum from per-channel analytics
            if (revData.perChannelAnalytics) {
              for (const pca of Object.values(revData.perChannelAnalytics) as Array<{ revenue?: { columnHeaders?: Array<{ name?: string | null }>; rows?: Array<Array<string | number>> } | null }>) {
                if (pca.revenue?.rows?.length && pca.revenue?.columnHeaders) {
                  const headers = pca.revenue.columnHeaders.map((h: { name?: string | null }) => h.name || "");
                  const revIdx = headers.indexOf("estimatedRevenue");
                  if (revIdx !== -1) {
                    totalRevenue += pca.revenue.rows.reduce((s: number, r: (string | number)[]) => s + (Number(r[revIdx]) || 0), 0);
                  }
                }
              }
            }
            // Subscribers from channel data
            if (revData.channels) {
              totalSubs = (revData.channels as Array<{ statistics?: { subscriberCount?: string | null } }>).reduce(
                (s: number, ch) => s + Number(ch?.statistics?.subscriberCount || 0), 0
              );
            }
          }
        }

        const cpm = totalAnalyticsViews > 0 ? (totalRevenue / totalAnalyticsViews) * 1000 : 0;
        const rpm = cpm;
        setClientRevenue({ totalRevenue, totalViews: totalAnalyticsViews, totalSubscribers: totalSubs, cpm, rpm });

        // Fetch channel info for each channel
        for (const chId of channelIds) {
          try {
            const chRes = await fetch(`/api/youtube?action=lookupChannel&query=${encodeURIComponent(chId)}&storedChannelIds=${encodeURIComponent(channelIds.join(","))}`);
            const chJson = await chRes.json();
            if (chRes.ok && chJson.data?.length) {
              const ch = chJson.data[0];
              const tokenInfo = tokenStatuses[chId] as { status?: string } | undefined;
              channelDetails.push({
                id: chId,
                name: ch.snippet?.title || chId,
                subscribers: Number(ch.statistics?.subscriberCount || 0),
                views: Number(ch.statistics?.viewCount || 0),
                videos: Number(ch.statistics?.videoCount || 0),
                thumbnail: ch.snippet?.thumbnails?.default?.url || "",
                tokenStatus: tokenInfo?.status === "valid" ? "Valid" : "Invalid",
              });
            } else {
              const tokenInfo = tokenStatuses[chId] as { status?: string } | undefined;
              channelDetails.push({
                id: chId, name: chId, subscribers: 0, views: 0, videos: 0, thumbnail: "",
                tokenStatus: tokenInfo?.status === "valid" ? "Valid" : "Invalid",
              });
            }
          } catch {
            channelDetails.push({
              id: chId, name: chId, subscribers: 0, views: 0, videos: 0, thumbnail: "", tokenStatus: "Invalid",
            });
          }
        }
      }

      setClientChannels(channelDetails);
    } catch {
      // silent
    } finally {
      setClientChannelsLoading(false);
    }
  }, []);

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === "active" ? "inactive" : "active";
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id, status: newStatus }),
      });
      fetchClients();
    } catch {
      // silent
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) return;
    try {
      await fetch(`/api/users?id=${clientId}`, { method: "DELETE" });
      fetchClients();
    } catch {
      // silent
    }
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
        <span className="text-foreground font-medium">User Management</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted mt-1">
            Create, edit, and manage client accounts. Clients can login with their email and password.
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
            <p className="text-sm text-blue-600 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Active Users</p>
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
              placeholder="Search by name, email..."
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
            Total: <span className="font-semibold text-primary">{filteredClients.length}</span> users
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted">Loading users...</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">User</th>
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
                      <button
                        onClick={() => openClientView(client)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                        title="Click to view client panel"
                      >
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {client.name[0]}
                        </div>
                        <span className="font-medium text-foreground underline decoration-dotted underline-offset-2">{client.name}</span>
                      </button>
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
                        onClick={() => handleToggleStatus(client)}
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
                          onClick={() => openClientView(client)}
                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Client Panel"
                        >
                          <Eye className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(client)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Change Password"
                        >
                          <Key className="w-4 h-4 text-amber-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageClients.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      No users found. Click &quot;Create User&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

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

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingClient ? "Edit User" : "Create New User"}
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
                    Name <span className="text-red-500">*</span>
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
                    disabled={!!editingClient}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Password {!editingClient && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingClient ? "Leave blank to keep current" : "Min 6 characters"}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
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
                disabled={saving}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingClient ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail View Modal */}
      {viewingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {viewingClient.name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{viewingClient.name}</h2>
                  <p className="text-sm text-muted">{viewingClient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  viewingClient.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {viewingClient.status === "active" ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => openEditModal(viewingClient)}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit User"
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => openPasswordModal(viewingClient)}
                  className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Change Password"
                >
                  <Key className="w-4 h-4 text-amber-500" />
                </button>
                <button
                  onClick={() => {
                    handleDeleteClient(viewingClient.id);
                    setViewingClient(null);
                  }}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                <button
                  onClick={() => setViewingClient(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg ml-2"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Client Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-medium">Category</p>
                  <p className="text-lg font-bold text-blue-900">{viewingClient.category}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-500" />
                    <p className="text-xs text-purple-600 font-medium">Channels</p>
                  </div>
                  <p className="text-lg font-bold text-purple-900">{viewingClient.channels.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <p className="text-xs text-green-600 font-medium">Valid Tokens</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {clientChannels.filter((c) => c.tokenStatus === "Valid").length}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-600 font-medium">Joined</p>
                  <p className="text-lg font-bold text-slate-900">{viewingClient.joinedDate}</p>
                </div>
              </div>

              {/* Revenue & Analytics Cards */}
              {clientRevenue && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      <p className="text-xs text-green-600 font-medium">Revenue (28d)</p>
                    </div>
                    <p className="text-lg font-bold text-green-900">${clientRevenue.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-xs text-blue-600 font-medium">Views (28d)</p>
                    </div>
                    <p className="text-lg font-bold text-blue-900">{clientRevenue.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                      <p className="text-xs text-purple-600 font-medium">Subscribers</p>
                    </div>
                    <p className="text-lg font-bold text-purple-900">{clientRevenue.totalSubscribers.toLocaleString()}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-600 font-medium">CPM</p>
                    <p className="text-lg font-bold text-amber-900">${clientRevenue.cpm.toFixed(2)}</p>
                  </div>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                    <p className="text-xs text-cyan-600 font-medium">RPM</p>
                    <p className="text-lg font-bold text-cyan-900">${clientRevenue.rpm.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {viewingClient.phone && (
                <div className="mb-4 text-sm text-muted">
                  Phone: <span className="font-medium text-foreground">{viewingClient.phone}</span>
                </div>
              )}

              {/* Channels Table */}
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-500" />
                Channels ({viewingClient.channels.length})
              </h3>

              {clientChannelsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted">Loading channel data...</span>
                </div>
              ) : clientChannels.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">
                  No channels assigned to this client.
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border">
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground">Channel</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground">Subscribers</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground">Views</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground">Videos</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground">Token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientChannels.map((ch) => (
                        <tr key={ch.id} className="border-b border-border hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {ch.thumbnail ? (
                                <img src={ch.thumbnail} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                  <Radio className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-foreground">{ch.name}</p>
                                <p className="text-xs text-muted">{ch.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {ch.subscribers.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {ch.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {ch.videos.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              ch.tokenStatus === "Valid"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {ch.tokenStatus === "Valid" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {ch.tokenStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-semibold">
                        <td className="px-4 py-2.5 text-foreground">Total</td>
                        <td className="px-4 py-2.5 text-foreground">
                          {clientChannels.reduce((sum, c) => sum + c.subscribers, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">
                          {clientChannels.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">
                          {clientChannels.reduce((sum, c) => sum + c.videos, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-green-600">
                            {clientChannels.filter((c) => c.tokenStatus === "Valid").length}/{clientChannels.length} Valid
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && passwordClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted">User</p>
                <p className="font-medium text-foreground">{passwordClient.name}</p>
                <p className="text-xs text-muted">{passwordClient.email}</p>
              </div>
              {passwordSuccess ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                  Password updated successfully!
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {!passwordSuccess && (
              <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={passwordSaving || newPassword.length < 6}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {passwordSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

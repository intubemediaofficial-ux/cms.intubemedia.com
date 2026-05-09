"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Radio,
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown,
  Shield,
  UserPlus,
  Activity,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  channels: string[];
  status: "active" | "inactive";
  joinedDate: string;
}

const CLIENTS_KEY = "bainsla_admin_clients";

function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === "active").length;
    const totalChannels = clients.reduce((sum, c) => sum + c.channels.length, 0);
    return { totalClients, activeClients, totalChannels };
  }, [clients]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin Panel</span>
        <span>›</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview of all clients, channels, and system metrics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Clients</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Active Clients</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Revenue Channels</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalChannels}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Clients</h2>
          <button
            onClick={() => router.push("/admin-clients")}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Channels</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 5).map((client) => (
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
                  <td className="px-4 py-3 text-foreground">{client.channels.length}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        client.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {client.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{client.joinedDate}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No clients yet. Go to Client Management to add clients.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/admin-clients")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">Add New Client</h3>
          </div>
          <p className="text-sm text-muted">Register a new client and assign YouTube channels.</p>
        </button>

        <button
          onClick={() => router.push("/admin-channels")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-foreground">Manage Channels</h3>
          </div>
          <p className="text-sm text-muted">View and manage all YouTube channels across clients.</p>
        </button>

        <button
          onClick={() => router.push("/admin-reports")}
          className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-foreground">View Reports</h3>
          </div>
          <p className="text-sm text-muted">Revenue reports and analytics across all clients.</p>
        </button>
      </div>
    </div>
  );
}

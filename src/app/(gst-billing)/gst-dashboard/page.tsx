"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Users, IndianRupee, FilePlus, TrendingUp, Clock } from "lucide-react";
import type { GstClient, GstInvoice } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

export default function GstDashboard() {
  const [clients, setClients] = useState<GstClient[]>([]);
  const [invoices, setInvoices] = useState<GstInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    let cancelled = false;
    Promise.all([
      fetch("/api/gst/clients").then((r) => r.json()),
      fetch("/api/gst/invoices").then((r) => r.json()),
    ])
      .then(([clientRes, invoiceRes]) => {
        if (cancelled) return;
        setClients(clientRes.data || []);
        setInvoices(invoiceRes.data || []);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "draft")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const recentInvoices = invoices.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">GST Billing Dashboard</h1>
          <p className="text-muted mt-1">Manage your GST invoices and clients</p>
        </div>
        <Link
          href="/gst-create-invoice"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          <FilePlus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Clients</p>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Invoices</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted">Pending Amount</p>
              <p className="text-xl font-bold">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
          </div>
          <div className="p-5">
            {recentInvoices.length === 0 ? (
              <p className="text-muted text-center py-8">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/gst-invoice-view?id=${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted">{inv.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(inv.grandTotal)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="w-3 h-3" />
                        {formatDate(inv.invoiceDate)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Clients</h2>
          </div>
          <div className="p-5">
            {clients.length === 0 ? (
              <p className="text-muted text-center py-8">No clients yet</p>
            ) : (
              <div className="space-y-3">
                {clients.slice(0, 5).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted">{client.city}, {client.state}</p>
                    </div>
                    <p className="text-xs font-mono text-muted">{client.gstin}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

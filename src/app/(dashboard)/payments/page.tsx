"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Loader2,
  DollarSign,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface Payment {
  id: string;
  networkName: string;
  revenueSharePercent: number;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  tdsPercent: number;
  tdsAmount: number;
  networkRevenue: number;
  netTotal: number;
  status: "pending" | "paid" | "processing";
  createdDate: string;
  notes: string;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const json = await res.json();
        setPayments(json.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchPayments();
  }, [status, fetchPayments]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.netTotal, 0);
  const totalPending = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.netTotal, 0);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted mt-1">View your monthly payment history and details.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Total Paid</p>
              <p className="text-xl font-bold text-foreground">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Pending</p>
              <p className="text-xl font-bold text-foreground">${totalPending.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Total Payments</p>
              <p className="text-xl font-bold text-foreground">{payments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {payments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-muted">No payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">Period</th>
                  <th className="text-left px-4 py-3 font-semibold">Network</th>
                  <th className="text-right px-4 py-3 font-semibold">Total Revenue</th>
                  <th className="text-right px-4 py-3 font-semibold">Network Share</th>
                  <th className="text-right px-4 py-3 font-semibold">TDS</th>
                  <th className="text-right px-4 py-3 font-semibold">Net Payable</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        {p.fromDate} <ArrowRight className="w-3 h-3 text-muted" /> {p.toDate}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.networkName || "-"}</td>
                    <td className="px-4 py-3 text-right font-medium">${p.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-muted">
                      ${p.networkRevenue.toFixed(2)} ({p.revenueSharePercent}%)
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      ${p.tdsAmount.toFixed(2)} ({p.tdsPercent}%)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">${p.netTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

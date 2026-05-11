"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Download } from "lucide-react";
import type { GstInvoice, GstBusinessSettings } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

function InvoiceViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [invoice, setInvoice] = useState<GstInvoice | null>(null);
  const [settings, setSettings] = useState<GstBusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);
  useEffect(() => {
    if (!id || didFetch.current) return;
    didFetch.current = true;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/gst/invoices?id=${id}`).then((r) => r.json()),
      fetch("/api/gst/settings").then((r) => r.json()),
    ])
      .then(([invRes, settingsRes]) => {
        if (cancelled) return;
        setInvoice(invRes.data || null);
        setSettings(settingsRes.data || null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Invoice not found</p>
        <button
          onClick={() => router.push("/gst-invoices")}
          className="mt-4 text-primary hover:underline"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const hasIgst = invoice.igst > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => router.push("/gst-invoices")}
          className="inline-flex items-center gap-2 text-muted hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-slate-50 font-medium"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-8 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none">
        <div className="text-center border-b-2 border-foreground pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">Tax Invoice</h1>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase mb-2">From</h3>
            <p className="font-bold text-lg">{settings?.companyName || "Your Company"}</p>
            <p className="text-sm mt-1">{settings?.address}</p>
            <p className="text-sm">
              {settings?.city}
              {settings?.state ? `, ${settings.state}` : ""} - {settings?.pincode}
            </p>
            <p className="text-sm font-mono mt-1">
              GSTIN: <strong>{settings?.gstin}</strong>
            </p>
            {settings?.pan && (
              <p className="text-sm font-mono">PAN: {settings.pan}</p>
            )}
            {settings?.phone && <p className="text-sm">Ph: {settings.phone}</p>}
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-muted">Invoice No:</span>{" "}
                <strong className="font-mono">{invoice.invoiceNumber}</strong>
              </p>
              <p className="text-sm">
                <span className="text-muted">Date:</span>{" "}
                <strong>{formatDate(invoice.invoiceDate)}</strong>
              </p>
              {invoice.dueDate && (
                <p className="text-sm">
                  <span className="text-muted">Due Date:</span>{" "}
                  <strong>{formatDate(invoice.dueDate)}</strong>
                </p>
              )}
              <p className="text-sm">
                <span className="text-muted">Place of Supply:</span>{" "}
                <strong>
                  {invoice.placeOfSupply} ({invoice.placeOfSupplyCode})
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-6 print:bg-gray-100">
          <h3 className="text-xs font-semibold text-muted uppercase mb-2">
            Bill To
          </h3>
          <p className="font-bold">{invoice.clientName}</p>
          <p className="text-sm">{invoice.clientAddress}</p>
          <p className="text-sm font-mono mt-1">
            GSTIN: <strong>{invoice.clientGstin}</strong>
          </p>
          <p className="text-sm">
            State: {invoice.clientState} ({invoice.clientStateCode})
          </p>
        </div>

        <table className="w-full text-sm mb-6 border border-border">
          <thead>
            <tr className="bg-foreground text-white text-xs uppercase">
              <th className="px-3 py-2 text-left w-8">#</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left w-20">HSN</th>
              <th className="px-3 py-2 text-right w-16">Qty</th>
              <th className="px-3 py-2 text-right w-24">Rate</th>
              <th className="px-3 py-2 text-right w-20">GST %</th>
              <th className="px-3 py-2 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-border">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{item.description}</td>
                <td className="px-3 py-2 font-mono">{item.hsn}</td>
                <td className="px-3 py-2 text-right">{item.qty}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {formatCurrency(item.rate)}
                </td>
                <td className="px-3 py-2 text-right">{item.gstRate}%</td>
                <td className="px-3 py-2 text-right font-mono">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {hasIgst ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted">IGST</span>
                <span className="font-mono">{formatCurrency(invoice.igst)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">CGST</span>
                  <span className="font-mono">{formatCurrency(invoice.cgst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">SGST</span>
                  <span className="font-mono">{formatCurrency(invoice.sgst)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-base border-t-2 border-foreground pt-2">
              <span>Grand Total</span>
              <span className="font-mono">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-6 print:bg-gray-100">
          <p className="text-sm">
            <span className="font-semibold">Amount in Words:</span>{" "}
            {invoice.amountInWords}
          </p>
        </div>

        {settings?.bankName && (
          <div className="border border-border rounded-lg p-4 mb-6">
            <h3 className="text-xs font-semibold text-muted uppercase mb-2">
              Bank Details
            </h3>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <p>
                <span className="text-muted">Bank:</span> {settings.bankName}
              </p>
              <p>
                <span className="text-muted">A/C No:</span>{" "}
                <span className="font-mono">{settings.accountNumber}</span>
              </p>
              <p>
                <span className="text-muted">IFSC:</span>{" "}
                <span className="font-mono">{settings.ifscCode}</span>
              </p>
              <p>
                <span className="text-muted">Branch:</span> {settings.branchName}
              </p>
            </div>
          </div>
        )}

        {invoice.notes && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted uppercase mb-1">
              Notes / Terms
            </h3>
            <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mt-12 pt-6 border-t border-border">
          <div>
            <p className="text-sm text-muted">Receiver&apos;s Signature</p>
            <div className="mt-8 border-b border-border w-48" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">
              For {settings?.companyName || "Company"}
            </p>
            <div className="mt-8 border-b border-border w-48 ml-auto" />
            <p className="text-xs text-muted mt-1">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <InvoiceViewContent />
    </Suspense>
  );
}

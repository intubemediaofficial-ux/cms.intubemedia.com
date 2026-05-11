"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileText } from "lucide-react";
import type { GstClient, GstBusinessSettings, InvoiceItem } from "@/lib/gst-types";
import { formatCurrency, isInterState } from "@/lib/gst-utils";

const GST_RATES = [0, 5, 12, 18, 28];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<GstClient[]>([]);
  const [settings, setSettings] = useState<GstBusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", hsn: "", qty: 1, rate: 0, amount: 0, gstRate: 18 },
  ]);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/gst/clients").then((r) => r.json()),
      fetch("/api/gst/settings").then((r) => r.json()),
    ])
      .then(([clientRes, settingsRes]) => {
        if (cancelled) return;
        setClients(clientRes.data || []);
        setSettings(settingsRes.data || null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "qty" || field === "rate") {
        item.amount = Number(item.qty) * Number(item.rate);
      }
      updated[index] = item;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", hsn: "", qty: 1, rate: 0, amount: 0, gstRate: 18 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const interState =
    settings && selectedClient
      ? isInterState(settings.stateCode, selectedClient.stateCode)
      : false;

  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  items.forEach((item) => {
    const tax = (item.amount * item.gstRate) / 100;
    if (interState) {
      totalIgst += tax;
    } else {
      totalCgst += tax / 2;
      totalSgst += tax / 2;
    }
  });
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async () => {
    if (!selectedClient) return alert("Please select a client");
    if (items.some((item) => !item.description.trim()))
      return alert("Please fill in all item descriptions");
    if (!settings?.companyName)
      return alert(
        "Please configure your business details in Settings first"
      );

    setSaving(true);
    try {
      const res = await fetch("/api/gst/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          invoiceDate,
          dueDate,
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          clientGstin: selectedClient.gstin,
          clientAddress: `${selectedClient.address}, ${selectedClient.city}, ${selectedClient.state} - ${selectedClient.pincode}`,
          clientState: selectedClient.state,
          clientStateCode: selectedClient.stateCode,
          placeOfSupply: selectedClient.state,
          placeOfSupplyCode: selectedClient.stateCode,
          items,
          subtotal,
          cgst: totalCgst,
          sgst: totalSgst,
          igst: totalIgst,
          totalTax,
          grandTotal,
          notes,
          status: "draft",
        }),
      });
      const result = await res.json();
      if (result.data?.id) {
        router.push(`/gst-invoice-view?id=${result.data.id}`);
      }
    } catch {
      alert("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const nextInvoiceNumber = settings
    ? `${settings.invoicePrefix}${String((settings.lastInvoiceNumber || 0) + 1).padStart(3, "0")}`
    : "...";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
        <p className="text-muted mt-1">
          Next Invoice: <span className="font-mono font-semibold">{nextInvoiceNumber}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Client *</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {selectedClient && (
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted">Client:</span>{" "}
                <span className="font-medium">{selectedClient.name}</span>
              </div>
              <div>
                <span className="text-muted">GSTIN:</span>{" "}
                <span className="font-mono">{selectedClient.gstin}</span>
              </div>
              <div>
                <span className="text-muted">State:</span> {selectedClient.state} ({selectedClient.stateCode})
              </div>
              <div>
                <span className="text-muted">Supply Type:</span>{" "}
                <span
                  className={`font-medium ${interState ? "text-orange-600" : "text-green-600"}`}
                >
                  {interState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-5 space-y-4">
        <h2 className="text-lg font-semibold">Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-medium text-muted uppercase">
                <th className="px-3 py-2 w-8">#</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2 w-24">HSN</th>
                <th className="px-3 py-2 w-20">Qty</th>
                <th className="px-3 py-2 w-28">Rate</th>
                <th className="px-3 py-2 w-24">GST %</th>
                <th className="px-3 py-2 w-28 text-right">Amount</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="px-3 py-2 text-muted">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => updateItem(idx, "hsn", e.target.value)}
                      className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="HSN"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                      min={1}
                      className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
                      min={0}
                      className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={item.gstRate}
                      onChange={(e) => updateItem(idx, "gstRate", Number(e.target.value))}
                      className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {GST_RATES.map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addItem}
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          {interState ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted">IGST</span>
              <span className="font-mono">{formatCurrency(totalIgst)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted">CGST</span>
                <span className="font-mono">{formatCurrency(totalCgst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">SGST</span>
                <span className="font-mono">{formatCurrency(totalSgst)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-base font-bold border-t border-border pt-2">
            <span>Grand Total</span>
            <span className="font-mono">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-5">
        <label className="block text-sm font-medium mb-1">Notes / Terms</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          placeholder="Payment terms, bank details, etc."
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/gst-invoices")}
          className="px-6 py-2.5 border border-border rounded-lg hover:bg-slate-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {saving ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}

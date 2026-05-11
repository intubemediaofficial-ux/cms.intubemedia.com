"use client";

import { useState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import type { GstBusinessSettings } from "@/lib/gst-types";
import { INDIAN_STATES } from "@/lib/gst-types";

export default function GstSettingsPage() {
  const [settings, setSettings] = useState<GstBusinessSettings>({
    companyName: "",
    address: "",
    city: "",
    state: "",
    stateCode: "",
    pincode: "",
    gstin: "",
    pan: "",
    phone: "",
    email: "",
    invoicePrefix: "INV/2024-25/",
    lastInvoiceNumber: 0,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    let cancelled = false;
    setLoading(true);
    fetch("/api/gst/settings")
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled && res.data) setSettings(res.data);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/gst/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleStateChange = (code: string) => {
    setSettings((s) => ({ ...s, stateCode: code, state: INDIAN_STATES[code] || "" }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Settings</h1>
          <p className="text-muted mt-1">
            Configure your company details for GST invoices
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-5 space-y-5">
        <h2 className="text-lg font-semibold border-b border-border pb-3">
          Company Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, companyName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GSTIN *</label>
            <input
              type="text"
              value={settings.gstin}
              onChange={(e) =>
                setSettings((s) => ({ ...s, gstin: e.target.value.toUpperCase() }))
              }
              maxLength={15}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              placeholder="07AABCU9603R1ZM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PAN</label>
            <input
              type="text"
              value={settings.pan}
              onChange={(e) =>
                setSettings((s) => ({ ...s, pan: e.target.value.toUpperCase() }))
              }
              maxLength={10}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={settings.address}
              onChange={(e) =>
                setSettings((s) => ({ ...s, address: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => setSettings((s) => ({ ...s, city: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              value={settings.stateCode}
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
            <label className="block text-sm font-medium mb-1">Pincode</label>
            <input
              type="text"
              value={settings.pincode}
              onChange={(e) =>
                setSettings((s) => ({ ...s, pincode: e.target.value }))
              }
              maxLength={6}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) =>
                setSettings((s) => ({ ...s, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings((s) => ({ ...s, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-5 space-y-5">
        <h2 className="text-lg font-semibold border-b border-border pb-3">
          Invoice Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Prefix</label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={(e) =>
                setSettings((s) => ({ ...s, invoicePrefix: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              placeholder="INV/2024-25/"
            />
            <p className="text-xs text-muted mt-1">
              Example: INV/2024-25/ will generate INV/2024-25/001
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Last Invoice Number
            </label>
            <input
              type="number"
              value={settings.lastInvoiceNumber}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  lastInvoiceNumber: Number(e.target.value),
                }))
              }
              min={0}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
            <p className="text-xs text-muted mt-1">
              Next invoice will be #{settings.lastInvoiceNumber + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-5 space-y-5">
        <h2 className="text-lg font-semibold border-b border-border pb-3">
          Bank Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              value={settings.bankName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, bankName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              type="text"
              value={settings.accountNumber}
              onChange={(e) =>
                setSettings((s) => ({ ...s, accountNumber: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code</label>
            <input
              type="text"
              value={settings.ifscCode}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  ifscCode: e.target.value.toUpperCase(),
                }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch Name</label>
            <input
              type="text"
              value={settings.branchName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, branchName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

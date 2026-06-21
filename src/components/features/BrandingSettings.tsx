"use client";

import { useState } from "react";
import { Palette, Save, Loader2 } from "lucide-react";

interface BrandingSettingsProps {
  userId: string;
  currentBranding?: {
    brandName?: string;
    brandColor?: string;
    brandLogo?: string;
  };
  onSave?: () => void;
}

const COLOR_PRESETS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Slate", value: "#475569" },
];

export default function BrandingSettings({ userId, currentBranding, onSave }: BrandingSettingsProps) {
  const [brandName, setBrandName] = useState(currentBranding?.brandName || "");
  const [brandColor, setBrandColor] = useState(currentBranding?.brandColor || "#6366f1");
  const [brandLogo, setBrandLogo] = useState(currentBranding?.brandLogo || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          branding: {
            brandName: brandName.trim() || undefined,
            brandColor: brandColor || undefined,
            brandLogo: brandLogo.trim() || undefined,
          },
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSave?.();
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-500" />
        White-Label Branding
      </h2>
      <p className="text-xs text-muted mb-4">Customize how your dashboard appears to your clients.</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Star Music India"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-[10px] text-muted mt-1">Your clients will see this name instead of InTubeMedia.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Brand Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                onClick={() => setBrandColor(c.value)}
                className={`w-7 h-7 rounded-lg border-2 transition-all ${brandColor === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Logo URL</label>
          <input
            type="url"
            value={brandLogo}
            onChange={(e) => setBrandLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {brandLogo && (
            <div className="mt-2 flex items-center gap-2">
              <img src={brandLogo} alt="Logo preview" className="w-8 h-8 rounded object-contain border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="text-[10px] text-muted">Preview</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted mb-3">Preview:</div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-slate-50">
            {brandLogo && <img src={brandLogo} alt="" className="w-6 h-6 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
            <span className="font-semibold text-sm" style={{ color: brandColor }}>{brandName || "Your Brand Name"}</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: brandColor }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Branding"}
        </button>
      </div>
    </div>
  );
}

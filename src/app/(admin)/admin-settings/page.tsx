"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Save, Users, Key } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Shield className="w-4 h-4 text-red-500" />
        <span className="text-red-500 font-medium">Admin</span>
        <span>›</span>
        <span className="text-foreground font-medium">Settings</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-sm text-muted mt-1">Configure system-level settings and admin accounts.</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Bainsla Music"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="vijendrachoudhary95@gmail.com"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Admin Users</h2>
          </div>
          <p className="text-sm text-muted mt-1">
            Emails with admin access (configured in auth.ts)
          </p>
        </div>
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">V</div>
                <div>
                  <p className="text-sm font-medium text-foreground">vijendrachoudhary95@gmail.com</p>
                  <p className="text-xs text-muted">Super Admin</p>
                </div>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">A</div>
                <div>
                  <p className="text-sm font-medium text-foreground">ajeetgurjarofficial@gmail.com</p>
                  <p className="text-xs text-muted">Admin</p>
                </div>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
            </div>
          </div>
          <p className="text-xs text-muted mt-3">
            To add more admin users, update the ADMIN_EMAILS list in <code className="bg-slate-100 px-1 rounded">src/lib/auth.ts</code>
          </p>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-green-700">YouTube Data API v3</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-green-700">YouTube Analytics API</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-green-700">YouTube Reporting API</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Enabled</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

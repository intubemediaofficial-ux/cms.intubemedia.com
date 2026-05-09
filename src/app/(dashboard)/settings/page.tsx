"use client";

import { useState } from "react";
import { Save, Key, Bell, Globe, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general", label: "General", icon: Globe },
    { id: "api", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Storage", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-border p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground hover:bg-slate-50"
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeSection === "general" && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">
                General Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Bainsla Music"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@bainslamusic.com"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Default Currency
                  </label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option>INR - Indian Rupee</option>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === "api" && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">
                API Configuration
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Google Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your Google Client ID"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Google Client Secret
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your Google Client Secret"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    YouTube API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your YouTube API Key"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
                  />
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Get your API credentials from{" "}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline"
                    >
                      Google Cloud Console
                    </a>
                    . Enable YouTube Data API v3, YouTube Analytics API, and
                    YouTube Reporting API.
                  </p>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <Save className="w-4 h-4" />
                  Save API Keys
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Email notifications for new subscribers",
                    desc: "Get notified when you reach subscriber milestones",
                  },
                  {
                    label: "Revenue reports",
                    desc: "Daily/weekly revenue summary emails",
                  },
                  {
                    label: "Video performance alerts",
                    desc: "Get notified when a video crosses view milestones",
                  },
                  {
                    label: "Content ID claims",
                    desc: "Notifications for new Content ID claims",
                  },
                  {
                    label: "Comment moderation",
                    desc: "Alerts for flagged or spam comments",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={index < 3}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">
                Security Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-light"
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Add extra security to your account
                    </p>
                  </div>
                  <button className="text-sm font-medium text-accent border border-accent/30 hover:bg-accent/5 px-4 py-2 rounded-lg transition-colors">
                    Enable 2FA
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <Save className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeSection === "data" && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">
                Data & Storage
              </h3>
              <div className="space-y-5">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-foreground">
                      Cache Storage
                    </p>
                    <span className="text-sm text-muted">245 MB / 1 GB</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: "24.5%" }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Auto-sync data from YouTube
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Automatically fetch new data every 6 hours
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
                <div className="flex gap-3">
                  <button className="text-sm font-medium text-foreground border border-border hover:bg-slate-50 px-4 py-2.5 rounded-lg transition-colors">
                    Clear Cache
                  </button>
                  <button className="text-sm font-medium text-danger border border-danger/30 hover:bg-danger/5 px-4 py-2.5 rounded-lg transition-colors">
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

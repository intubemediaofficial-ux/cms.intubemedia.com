"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const userName = session?.user?.name || "Bainsla Music";
  const userRole = session?.user?.role === "admin" ? "Admin" : "Client";
  const initials = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, channels..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-light"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-foreground hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted">{userRole}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted" />
        </div>
      </div>
    </header>
  );
}

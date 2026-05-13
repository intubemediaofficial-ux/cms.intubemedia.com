"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Package,
  Tags,
  AlertTriangle,
  Radio,
  FileVideo,
  Shield,
  BarChart3,
  Target,
  CheckCircle,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { href: "/cms-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cms-videos", label: "Videos", icon: Video },
  { href: "/cms-assets", label: "Assets", icon: Package },
  { href: "/cms-asset-labels", label: "Asset labels", icon: Tags },
  { href: "/cms-issues", label: "Issues", icon: AlertTriangle },
  { href: "/cms-channels", label: "Channels", icon: Radio },
  { href: "/cms-claimed-videos", label: "Claimed videos", icon: FileVideo },
  { href: "/cms-policies", label: "Policies", icon: Shield },
  { href: "/cms-analytics", label: "Analytics", icon: BarChart3 },
  { href: "/cms-campaigns", label: "Campaigns", icon: Target },
  { href: "/cms-allowlist", label: "Allowlist", icon: CheckCircle },
  { href: "/cms-reports", label: "Reports", icon: FileText },
  { href: "/cms-content-updates", label: "Content Updates", icon: Upload },
  { href: "/cms-settings", label: "Settings", icon: Settings },
];

export default function CmsSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white flex flex-col transition-all duration-200 z-40",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* YouTube Studio Header */}
      <div className="h-[56px] flex items-center px-3 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu className="w-6 h-6 text-[#606060]" />
        </button>
        {!collapsed && (
          <Link href="/cms-dashboard" className="flex items-center gap-1 ml-3">
            {/* YouTube Play Button */}
            <svg viewBox="0 0 90 20" className="h-5 w-auto">
              <svg viewBox="0 0 28 20" width="28" height="20">
                <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
                <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
              </svg>
              <text x="32" y="15" fill="#282828" fontFamily="'YouTube Sans','Roboto',sans-serif" fontSize="15" fontWeight="500">Studio</text>
            </svg>
          </Link>
        )}
      </div>

      {/* CMS Account - Exact YouTube CMS avatar (pink/magenta circle + building icon) */}
      <div className={cn("flex flex-col items-center py-4 px-3", collapsed && "py-3")}>
        <div className={cn(
          "rounded-full bg-[#9B2E83] flex items-center justify-center",
          collapsed ? "w-8 h-8" : "w-[88px] h-[88px]"
        )}>
          {/* Building/grid icon matching YouTube CMS Content Manager exactly */}
          <svg viewBox="0 0 24 24" className={cn("text-white", collapsed ? "w-4 h-4" : "w-10 h-10")} fill="currentColor">
            <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm1 1h2v2H7V7zm3 0h2v2h-2V7zm3 0h2v2h-2V7zm-6 3h2v2H7v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-6 3h2v2H7v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z"/>
          </svg>
        </div>
        {!collapsed && (
          <p className="mt-3 text-[14px] text-[#282828] font-normal">Bainsla CMS</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pb-2">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center h-10 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#f2f2f2] text-[#282828]"
                      : "text-[#606060] hover:bg-[#f2f2f2]",
                    collapsed ? "justify-center mx-1 rounded-lg px-0" : "pl-6 pr-4"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-[#282828]" : "text-[#606060]"
                  )} strokeWidth={1.5} />
                  {!collapsed && <span className="ml-6">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle at bottom */}
      <div className="py-2 shrink-0">
        {!collapsed ? (
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center h-10 pl-6 pr-4 text-[13px] text-[#606060] hover:bg-[#f2f2f2] transition-colors w-full"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            <span className="ml-6">Collapse</span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#606060]" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

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
  Search,
  HelpCircle,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Header - YouTube Studio style */}
      <div className="h-[56px] flex items-center px-4 border-b border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        {!collapsed && (
          <Link href="/cms-dashboard" className="flex items-center gap-1.5">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-800 leading-tight">Studio</span>
              <span className="text-[10px] text-gray-500 leading-tight">Content Manager</span>
            </div>
          </Link>
        )}
      </div>

      {/* CMS Account info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              BM
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">Bainsla Music001</p>
              <p className="text-xs text-gray-500 truncate">Content Manager</p>
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center py-3 border-b border-gray-200">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            BM
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-100",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-red-600 rounded-r" />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-red-600" : "text-gray-500")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 py-2">
        {!collapsed ? (
          <div className="px-4 py-2">
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

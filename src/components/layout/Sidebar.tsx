"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Video,
  Radio,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Music2,
  DollarSign,
  Users,
  LinkIcon,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/channels",
    label: "Channels",
    icon: Radio,
    children: [
      { href: "/channels", label: "Active Channels", icon: LinkIcon },
      { href: "/delinked-channels", label: "Delinked Channels", icon: Unlink },
    ],
  },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/revenue", label: "Revenue", icon: DollarSign },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ "/channels": true });
  const pathname = usePathname();

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-white flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Music2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold leading-tight">Bainsla</h1>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-primary uppercase">
              Music
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || item.children?.some((c) => pathname === c.href);
            const isOpen = openMenus[item.href];

            if (item.children && !collapsed) {
              return (
                <li key={item.href}>
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-sidebar-hover"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {isOpen && (
                    <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-3">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                isChildActive
                                  ? "bg-primary text-white shadow-md shadow-primary/30"
                                  : "text-white/60 hover:text-white hover:bg-sidebar-hover"
                              )}
                            >
                              <child.icon className="w-4 h-4 shrink-0" />
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            if (item.children && collapsed) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "text-white/70 hover:text-white hover:bg-sidebar-hover"
                    )}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "text-white/70 hover:text-white hover:bg-sidebar-hover"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-hover transition-all"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-dark transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}

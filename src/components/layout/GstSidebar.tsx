"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  FilePlus,
  Settings,
  Receipt,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/gst-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gst-clients", label: "Clients", icon: Users },
  { href: "/gst-create-invoice", label: "Create Invoice", icon: FilePlus },
  { href: "/gst-invoices", label: "Invoices", icon: FileText },
  { href: "/gst-settings", label: "Settings", icon: Settings },
];

export default function GstSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[250px] bg-sidebar text-white flex flex-col">
      <div className="p-5 border-b border-sidebar-hover">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">GST Billing</h1>
            <p className="text-xs text-muted-light">Invoice Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active text-secondary font-semibold"
                  : "text-gray-300 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-hover">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to CMS
        </Link>
      </div>
    </aside>
  );
}

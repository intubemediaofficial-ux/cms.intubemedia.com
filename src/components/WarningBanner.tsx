"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Info, Wrench, X } from "lucide-react";

interface AdminWarning {
  id: string;
  message: string;
  type: "maintenance" | "warning" | "info";
  createdAt: string;
  createdBy: string;
}

export default function WarningBanner() {
  const [globalWarning, setGlobalWarning] = useState<AdminWarning | null>(null);
  const [clientWarning, setClientWarning] = useState<AdminWarning | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchWarnings = () => {
      fetch("/api/client-data?action=getMyWarnings")
        .then((r) => r.json())
        .then((j) => {
          setGlobalWarning(j.data?.global || null);
          setClientWarning(j.data?.client || null);
        })
        .catch(() => {});
    };

    fetchWarnings();
    // Poll every 30s so banner auto-hides when admin resolves maintenance
    const interval = setInterval(fetchWarnings, 30000);
    return () => clearInterval(interval);
  }, []);

  const warnings = [globalWarning, clientWarning].filter(
    (w): w is AdminWarning => w !== null && !dismissed.has(w.id)
  );

  if (warnings.length === 0) return null;

  const getStyle = (type: string) => {
    switch (type) {
      case "maintenance":
        return { bg: "bg-amber-50 border-amber-300", text: "text-amber-800", icon: <Wrench className="w-4 h-4 text-amber-600 shrink-0" /> };
      case "warning":
        return { bg: "bg-red-50 border-red-300", text: "text-red-800", icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> };
      default:
        return { bg: "bg-blue-50 border-blue-300", text: "text-blue-800", icon: <Info className="w-4 h-4 text-blue-600 shrink-0" /> };
    }
  };

  return (
    <div className="space-y-0">
      {warnings.map((w) => {
        const style = getStyle(w.type);
        return (
          <div key={w.id} className={`${style.bg} border-b ${style.text} px-4 py-2.5 flex items-center gap-2`}>
            {style.icon}
            <p className="text-sm font-medium flex-1">{w.message}</p>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, w.id]))}
              className="p-0.5 hover:opacity-70 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

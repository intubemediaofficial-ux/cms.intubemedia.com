"use client";

import CmsSidebar from "@/components/layout/CmsSidebar";
import CmsTopBar from "@/components/layout/CmsTopBar";

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <CmsSidebar />
      <div className="flex-1 ml-[240px] transition-all duration-300">
        <CmsTopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

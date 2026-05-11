import GstSidebar from "@/components/layout/GstSidebar";

export default function GstBillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <GstSidebar />
      <div className="flex-1 ml-[250px] transition-all duration-300">
        <main className="p-6 bg-slate-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
}

import PublicHeader from "@/components/public-header";
import DashboardNav from "@/components/dashboard-nav";

export default function PageShell({ children, area }: { children: React.ReactNode; area: string }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <PublicHeader />
    <div className="mx-auto grid max-w-7xl lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-white p-5 lg:border-b-0 lg:border-r">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">{area}</p>
        <DashboardNav admin />
      </aside>
      <main id="main-content" tabIndex={-1} className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  </div>;
}

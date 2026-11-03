import { privateMetadata } from "@/lib/seo";
export const metadata = privateMetadata;
import Link from "next/link";
import DashboardNav from "@/components/dashboard-nav";
import AuthIsland from "@/components/auth-island";
import { requireUser } from "@/lib/require-auth";
import { can } from "@/lib/permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-xl focus:bg-white focus:p-4">Bỏ qua điều hướng</a>
    <aside className="border-b border-slate-200 bg-white p-5 lg:border-r lg:border-b-0">
      <Link href="/" className="mb-6 block text-lg font-bold text-indigo-700">Class Deadline Hub</Link>
      <DashboardNav admin={can(user.role, "admin:access")} />
    </aside>
    <div className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8"><div><p className="font-bold">Không gian học tập</p><p className="text-sm text-slate-500">Tiến độ riêng của {user.name}</p></div><AuthIsland /></header>
      <main id="dashboard-content" tabIndex={-1} className="mx-auto max-w-6xl p-5 sm:p-8">{children}</main>
    </div>
  </div>;
}

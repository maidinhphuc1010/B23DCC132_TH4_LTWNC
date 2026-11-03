import Link from "next/link";
import { Suspense } from "react";

export default function PageShell({ children, area }: { children: React.ReactNode; area: string }) {
  return <div className="mx-auto w-full max-w-5xl p-6">
    <header className="mb-8 space-y-3 border-b pb-4">
      <p className="font-bold">Class Deadline Hub · {area}</p>
      <nav className="flex flex-wrap gap-4" aria-label="Điều hướng chính">
        <Link href="/">Môn học</Link><Link href="/deadlines">Deadline</Link>
        <Link href="/login">Đăng nhập</Link><Link href="/dashboard">Dashboard</Link><Link href="/admin">Quản trị</Link>
      </nav>
    </header>
    <main><Suspense fallback={<p>Đang tải dữ liệu…</p>}>{children}</Suspense></main>
  </div>;
}

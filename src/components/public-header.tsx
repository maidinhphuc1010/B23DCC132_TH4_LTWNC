import Link from "next/link";
import { CalendarDays } from "lucide-react";
import AuthIsland from "@/components/auth-island";

export default function PublicHeader() {
  return <header className="border-b border-slate-200 bg-white">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Bỏ qua điều hướng</a>
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3 font-bold tracking-tight text-slate-950" aria-label="Class Deadline Hub — Trang chủ">
        <span className="rounded-xl bg-indigo-600 p-2.5 text-white"><CalendarDays size={23} aria-hidden="true" /></span>
        <span>Class Deadline <span className="text-indigo-600">Hub</span><span className="block text-xs font-normal tracking-wide text-slate-500">CÙNG LỚP HỌC CHỦ ĐỘNG</span></span>
      </Link>
      <nav aria-label="Điều hướng chính" className="order-3 flex w-full flex-wrap gap-6 text-sm font-medium text-slate-600 sm:order-none sm:w-auto">
        <Link className="hover:text-indigo-700" href="/">Trang chủ</Link>
        <Link className="hover:text-indigo-700" href="/#subjects">Môn học</Link>
        <Link className="hover:text-indigo-700" href="/deadlines">Deadline</Link>
      </nav>
      <div aria-label="Tài khoản"><AuthIsland /></div>
    </div>
  </header>;
}

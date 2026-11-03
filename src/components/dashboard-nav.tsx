"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, BookOpen, ShieldCheck } from "lucide-react";

export default function DashboardNav({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const links = [{ href: "/dashboard", label: "Tổng quan" }, { href: "/deadlines", label: "Deadline công khai" }, { href: "/", label: "Môn học" }, ...(admin ? [{ href: "/admin", label: "Quản trị" }] : [])];
  return <nav aria-label="Menu dashboard" className="flex flex-wrap gap-2 lg:flex-col">{links.map(({ href, label }) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    const Icon = href === "/dashboard" ? LayoutDashboard : href === "/admin" ? ShieldCheck : href === "/" ? BookOpen : CalendarDays;
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}><Icon size={18} className="shrink-0" aria-hidden="true" />{label}</Link>;
  })}</nav>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const links = [{ href: "/dashboard", label: "Tổng quan" }, { href: "/deadlines", label: "Deadline công khai" }, { href: "/", label: "Môn học" }, ...(admin ? [{ href: "/admin", label: "Quản trị" }] : [])];
  return <nav aria-label="Menu dashboard" className="flex flex-wrap gap-2 lg:flex-col">{links.map(({ href, label }) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-xl px-4 py-3 text-sm font-semibold ${active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>{label}</Link>;
  })}</nav>;
}

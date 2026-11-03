import { privateMetadata } from "@/lib/seo";
export const metadata = privateMetadata;
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return <section className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12"><ShieldAlert className="mx-auto mb-5 text-amber-600" size={48} aria-hidden="true" /><h1 className="text-3xl font-bold">403 — Không có quyền truy cập</h1><p className="mt-4 leading-7 text-slate-600">Tài khoản của bạn không có quyền truy cập khu vực này. Trang quản trị chỉ dành cho quản trị viên.</p><div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/" className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">Về trang chủ</Link><Link href="/deadlines" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50">Xem deadline công khai</Link></div></section>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function RouteError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <section role="alert" className="mx-auto my-8 w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-10">
    <AlertTriangle className="mb-5 text-rose-700" size={36} aria-hidden="true" />
    <h2 className="text-2xl font-bold text-slate-950">Không thể tải dữ liệu</h2>
    <p className="mt-3 leading-7 text-slate-600">Đã xảy ra lỗi tạm thời. Bạn có thể thử tải lại hoặc quay về trang chủ. Dữ liệu đã lưu không bị thay đổi.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" disabled={pending} onClick={() => startTransition(() => { router.refresh(); reset(); })} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"><RotateCcw size={18} aria-hidden="true" />{pending ? "Đang thử lại…" : "Thử lại"}</button>
      <Link href="/" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Về trang chủ</Link>
    </div>
  </section>;
}

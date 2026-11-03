import Link from "next/link";
import { FileQuestion, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return <section aria-labelledby="not-found-title" className="mx-auto my-12 w-full max-w-2xl px-5 text-center sm:my-20">
    <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-12">
      <FileQuestion size={56} className="mx-auto text-indigo-600" aria-hidden="true" />
      <p className="mt-6 text-sm font-bold tracking-widest text-indigo-700">LỖI 404</p>
      <h1 id="not-found-title" className="mt-3 text-3xl font-bold text-slate-950">Không tìm thấy trang</h1>
      <p className="mt-4 leading-7 text-slate-600">Môn học hoặc deadline không tồn tại, đã bị xóa hoặc đường dẫn chưa chính xác.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"><Home size={18} aria-hidden="true" />Về trang chủ</Link>
        <Link href="/deadlines" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">Xem deadline <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}

import Link from "next/link";
import PublicHeader from "@/components/public-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
    <PublicHeader />
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-5 py-8 text-sm sm:flex-row sm:px-8">
        <div><p className="font-bold text-slate-900">Class Deadline Hub</p><p className="mt-2 text-slate-500">Một nơi cho mọi deadline. Cùng lớp tiến về phía trước.</p></div>
        <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-5 text-slate-600"><Link href="/#subjects" className="hover:text-indigo-700">Môn học</Link><Link href="/deadlines" className="hover:text-indigo-700">Deadline</Link><Link href="/login" className="hover:text-indigo-700">Tài khoản</Link></nav>
      </div>
    </footer>
  </div>;
}

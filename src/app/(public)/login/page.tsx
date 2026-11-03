import { privateMetadata } from "@/lib/seo";
export const metadata = privateMetadata;
import { Suspense } from "react";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><h1 className="text-3xl font-bold">Đăng nhập</h1><p className="mt-3 text-sm leading-6 text-slate-600">Sử dụng tài khoản lớp học để quản lý deadline của bạn.</p><Suspense fallback={<p className="mt-8" role="status">Đang tải biểu mẫu…</p>}><LoginForm /></Suspense></section>;
}

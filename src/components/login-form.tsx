"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema, safeReturnPath } from "@/lib/login-validation";

export default function LoginForm() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return <form className="mt-8 space-y-5" onSubmit={async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    const destination = safeReturnPath(params.get("callbackUrl") ?? params.get("next"));
    setLoading(true);
    try {
      const result = await signIn("credentials", { ...parsed.data, redirect: false, redirectTo: destination });
      if (result.error || !result.ok) { setError("Email hoặc mật khẩu không đúng."); setLoading(false); return; }
      window.location.assign(destination);
    } catch { setError("Không thể đăng nhập. Vui lòng thử lại."); setLoading(false); }
  }}>
    <label className="block text-sm font-semibold" htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={loading} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
    <label className="block text-sm font-semibold" htmlFor="password">Mật khẩu<input id="password" name="password" type="password" autoComplete="current-password" required maxLength={72} disabled={loading} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? "Đang đăng nhập…" : "Đăng nhập"}</button>
  </form>;
}

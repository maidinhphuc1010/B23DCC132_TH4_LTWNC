"use client";

import Link from "next/link";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import type { Role } from "@/types";

const labels: Record<Role, string> = { admin: "Quản trị viên", user: "Sinh viên", guest: "Khách" };
function Account() {
  const { data, status } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (status === "loading") return <span role="status" className="text-sm text-slate-500">Đang kiểm tra tài khoản…</span>;
  if (!data) return <Link href="/login" className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Đăng nhập</Link>;
  return <div className="flex flex-wrap items-center gap-3 text-sm">
    <div><p className="font-semibold">{data.user.name}</p><p className="text-xs text-slate-500">{labels[data.user.role]}</p></div>
    <button disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      try { await signOut({ redirectTo: "/" }); }
      catch { setError("Không thể đăng xuất. Vui lòng thử lại."); setBusy(false); }
    }} className="rounded-full border border-slate-300 px-4 py-2 hover:bg-slate-100 disabled:opacity-50">{busy ? "Đang đăng xuất…" : "Đăng xuất"}</button>
    {error && <p role="alert" className="text-rose-700">{error}</p>}
  </div>;
}

export default function AuthIsland() {
  return <SessionProvider><Account /></SessionProvider>;
}

"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <section role="alert" className="rounded-2xl border border-rose-200 bg-white p-8"><h2 className="text-xl font-bold">Không thể tải dashboard</h2><p className="mt-3 text-slate-600">Vui lòng thử lại sau. Trạng thái đã lưu của bạn không bị thay đổi.</p><button onClick={reset} className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white">Thử lại</button></section>;
}

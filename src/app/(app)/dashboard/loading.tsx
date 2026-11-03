export default function DashboardLoading() {
  return <div role="status" className="animate-pulse space-y-6"><p className="text-slate-600">Đang tải dashboard…</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-200" />)}</div><div className="h-64 rounded-2xl bg-slate-200" /></div>;
}

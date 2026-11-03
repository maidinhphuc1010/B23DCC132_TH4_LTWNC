export default function LoadingSkeleton({ label = "Đang tải danh sách…" }: { label?: string }) {
  return <section role="status" aria-busy="true" className="space-y-6">
    <p className="text-sm font-semibold text-indigo-700">{label}</p>
    <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
      <div className="h-9 w-2/3 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((id) => <div key={id} className="h-24 rounded-2xl bg-slate-200" />)}</div>
      <div className="grid gap-5 md:grid-cols-2">{[1, 2, 3, 4].map((id) => <div key={id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"><div className="h-5 w-1/3 rounded bg-indigo-100" /><div className="h-7 w-3/4 rounded bg-slate-200" /><div className="h-16 rounded bg-slate-100" /><div className="h-5 w-1/2 rounded bg-slate-200" /></div>)}</div>
    </div>
  </section>;
}

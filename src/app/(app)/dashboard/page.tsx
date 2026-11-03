import Link from "next/link";
import { requireUser } from "@/lib/require-auth";
import { getCompletionsByUserId, getDeadlines, getSubjects } from "@/lib/repository";
import CompletionForm from "@/components/completion-form";
import DeadlineCountdown from "@/components/deadline-countdown";

// auth() inside requireUser() reads the request session: no private data is prerendered/cached.
export default async function DashboardPage() {
  const user = await requireUser();
  const [deadlines, subjects, completions] = await Promise.all([getDeadlines(), getSubjects(), getCompletionsByUserId(user.id)]);
  const completedIds = new Set(completions.map((item) => item.deadlineId));
  const done = deadlines.filter((item) => completedIds.has(item.id)).length;
  const now = new Date().getTime();
  const overdue = deadlines.filter((item) => !completedIds.has(item.id) && Date.parse(item.dueAt) <= now).length;
  const stats = [["Tổng deadline", deadlines.length], ["Đã hoàn thành", done], ["Chưa hoàn thành", deadlines.length - done], ["Quá hạn chưa hoàn thành", overdue]] as const;
  return <section className="space-y-8">
    <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-3 text-slate-600">Xin chào <strong>{user.name}</strong>! Theo dõi tiến độ của riêng bạn tại đây.</p></div>
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-3 text-3xl font-bold text-indigo-700">{value}</dd></div>)}</dl>
    <p className="text-sm text-slate-500">Quá hạn chỉ tính bài chưa hoàn thành có thời điểm hết hạn đã qua. Hạn nộp hiển thị theo giờ Việt Nam (UTC+7).</p>
    {deadlines.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-semibold">Chưa có deadline</h2><p className="mt-2 text-slate-500">Các bài tập mới của lớp sẽ xuất hiện tại đây.</p></div>}
    {subjects.map((subject) => {
      const items = deadlines.filter((item) => item.subjectId === subject.id);
      if (!items.length) return null;
      return <section key={subject.id} className="space-y-4"><h2 className="text-xl font-bold">{subject.name} <span className="text-sm font-normal text-slate-500">({items.length})</span></h2>
        <ul className="grid gap-4 xl:grid-cols-2">{items.map((deadline) => {
          const completed = completedIds.has(deadline.id);
          return <li key={deadline.id} data-deadline-id={deadline.id} data-completed={String(completed)} className={`rounded-2xl border bg-white p-5 shadow-sm ${completed ? "border-emerald-200" : "border-slate-200"}`}>
            <p className={`mb-3 text-sm font-semibold ${completed ? "text-emerald-700" : "text-slate-500"}`}>{completed ? "✓ Đã hoàn thành" : "Chưa hoàn thành"}</p>
            <h3 className="text-lg font-bold"><Link href={`/deadlines/${deadline.id}`} className="hover:text-indigo-700">{deadline.title}</Link></h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{deadline.description}</p>
            <p className="my-3 text-sm text-slate-500">Hạn nộp: <time dateTime={deadline.dueAt}>{new Date(deadline.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time></p>
            {!completed && <DeadlineCountdown dueAt={deadline.dueAt} initialNow={now} />}
            <CompletionForm deadlineId={deadline.id} completed={completed} />
          </li>;
        })}</ul>
      </section>;
    })}
  </section>;
}


import Link from "next/link";
import { requireAdmin } from "@/lib/require-auth";
import { getDeadlines, getSubjects } from "@/lib/repository";
import AddDeadlineForm from "@/components/add-deadline-form";
import DeleteDeadlineButton from "@/components/delete-deadline-button";

export default async function AdminPage() {
  const user = await requireAdmin();
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const now = new Date().getTime();

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Quản trị Deadline</h1>
        <p className="mt-3 text-slate-600">Xin chào <strong>{user.name}</strong>. Quản lý toàn bộ deadline của lớp tại đây.</p>
      </div>

      {/* Stats */}
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Tổng deadline</dt>
          <dd className="mt-3 text-3xl font-bold text-indigo-700">{deadlines.length}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Môn học</dt>
          <dd className="mt-3 text-3xl font-bold text-indigo-700">{subjects.length}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Quá hạn</dt>
          <dd className="mt-3 text-3xl font-bold text-rose-600">{deadlines.filter((d) => Date.parse(d.dueAt) <= now).length}</dd>
        </div>
      </dl>

      {/* Add form */}
      <AddDeadlineForm subjects={subjects} />

      {/* Deadline list */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Danh sách deadline ({deadlines.length})</h2>
        {deadlines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold">Chưa có deadline nào</p>
            <p className="mt-2 text-slate-500">Sử dụng biểu mẫu ở trên để thêm deadline đầu tiên.</p>
          </div>
        )}
        <ul className="grid gap-4 xl:grid-cols-2">
          {deadlines.map((deadline) => {
            const subject = subjectMap.get(deadline.subjectId);
            return (
              <li key={deadline.id} data-deadline-id={deadline.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{subject?.name ?? deadline.subjectId}</span>
                  <span className="text-xs text-slate-400">{deadline.id}</span>
                </div>
                <h3 className="text-lg font-bold">
                  <Link href={`/deadlines/${deadline.id}`} className="hover:text-indigo-700">{deadline.title}</Link>
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{deadline.description}</p>
                <p className="my-3 text-sm text-slate-500">
                  Hạn nộp: <time dateTime={deadline.dueAt}>{new Date(deadline.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time>
                </p>
                <DeleteDeadlineButton deadlineId={deadline.id} title={deadline.title} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}


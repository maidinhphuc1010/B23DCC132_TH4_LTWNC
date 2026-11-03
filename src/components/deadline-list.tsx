import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Deadline, Subject } from "@/types";

export default function DeadlineList({ deadlines, subjects = [] }: { deadlines: Deadline[]; subjects?: Subject[] }) {
  if (deadlines.length === 0) return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Chưa có deadline trong danh sách này.</p>;
  return <ul className="grid gap-4 md:grid-cols-2">{deadlines.map((deadline) => {
    const subject = subjects.find((item) => item.id === deadline.subjectId);
    return <li key={deadline.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {subject && <Link href={`/subjects/${subject.slug}`} className="mb-3 text-xs font-semibold text-indigo-700 hover:underline">{subject.name}</Link>}
      <h3 className="text-lg font-bold leading-7 text-slate-950"><Link className="hover:text-indigo-700" href={`/deadlines/${deadline.id}`}>{deadline.title}</Link></h3>
      <p className="mt-2 grow text-sm leading-6 text-slate-600">{deadline.description}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"><Clock3 size={16} aria-hidden="true" /><span>Hạn nộp: <time dateTime={deadline.dueAt}>{new Date(deadline.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" })}</time></span></span>
        <Link href={`/deadlines/${deadline.id}`} aria-label={`Chi tiết: ${deadline.title}`} className="rounded-full bg-slate-100 p-2 text-indigo-700 hover:bg-indigo-100"><ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </li>;
  })}</ul>;
}

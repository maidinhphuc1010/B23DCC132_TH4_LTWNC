"use client";

import Link from "next/link";
import { useState } from "react";
import type { Deadline, Subject } from "@/types";
import { deadlineTiming, statusLabels } from "@/lib/deadline-time";
import { TimingBadge, useDeadlineClock } from "@/components/deadline-countdown";

export default function DeadlineBrowser({ deadlines, subjects, initialNow }: { deadlines: Deadline[]; subjects: Subject[]; initialNow: number }) {
  const [subjectId, setSubjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const now = useDeadlineClock(initialNow);
  const visible = deadlines.filter((d) => (subjectId === "all" || d.subjectId === subjectId) && (status === "all" || deadlineTiming(d.dueAt, now).status === status));
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <label className="flex min-w-0 basis-full flex-1 flex-col gap-2 text-sm font-semibold sm:basis-48">Môn học<select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border border-slate-300 bg-white p-3"><option value="all">Tất cả môn học</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="flex min-w-0 basis-full flex-1 flex-col gap-2 text-sm font-semibold sm:basis-48">Trạng thái<select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 bg-white p-3"><option value="all">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <button type="button" onClick={() => { setSubjectId("all"); setStatus("all"); }} className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold hover:bg-indigo-100">Xóa bộ lọc</button>
    </div>
    <p role="status" className="text-sm text-slate-500">Hiển thị {visible.length}/{deadlines.length} deadline · Sắp hết hạn: trong hôm nay hoặc 2 ngày tiếp theo.</p>
    <ul className="grid gap-5 md:grid-cols-2">{visible.map((d) => {
      const subject = subjects.find((s) => s.id === d.subjectId);
      const state = deadlineTiming(d.dueAt, now).status;
      return <li key={d.id} className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${state === "overdue" ? "border-rose-200" : state === "soon" ? "border-amber-300" : "border-slate-200"}`}>
        <div className="mb-4"><TimingBadge dueAt={d.dueAt} now={now} /></div>
        {subject && <Link href={`/subjects/${subject.slug}`} className="text-xs font-semibold text-indigo-700 hover:underline">{subject.name}</Link>}
        <h2 className="mt-2 text-xl font-bold"><Link href={`/deadlines/${d.id}`} className="hover:text-indigo-700">{d.title}</Link></h2>
        <p className="mt-3 grow text-sm leading-7 text-slate-600">{d.description}</p>
        <p className="mt-5 text-sm text-slate-600">Hạn nộp: <time dateTime={d.dueAt}>{new Date(d.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" })}</time> (UTC+7)</p>
        <Link href={`/deadlines/${d.id}`} className="mt-4 text-sm font-semibold text-indigo-700 hover:underline">Xem chi tiết →</Link>
      </li>;
    })}</ul>
    {visible.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Không có deadline phù hợp với bộ lọc.</p>}
  </div>;
}

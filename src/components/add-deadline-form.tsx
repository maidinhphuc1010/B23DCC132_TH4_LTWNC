"use client";

import { useActionState } from "react";
import { addDeadline, type DeadlineActionState } from "@/actions/deadline";
import type { Subject } from "@/types";

const initial: DeadlineActionState = { error: "", fieldErrors: {}, message: "" };

export default function AddDeadlineForm({ subjects }: { subjects: Subject[] }) {
  const [state, action, pending] = useActionState(addDeadline, initial);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Thêm deadline mới</h2>

      <div>
        <label htmlFor="add-title" className="mb-1 block text-sm font-semibold">Tiêu đề <span className="text-rose-600">*</span></label>
        <input id="add-title" name="title" type="text" required maxLength={500} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="VD: Thực hành 6: Deployment" />
        {state.fieldErrors.title?.map((e) => <p key={e} className="mt-1 text-sm text-rose-700">{e}</p>)}
      </div>

      <div>
        <label htmlFor="add-desc" className="mb-1 block text-sm font-semibold">Mô tả <span className="text-rose-600">*</span></label>
        <textarea id="add-desc" name="description" required maxLength={2000} rows={3} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Mô tả yêu cầu bài tập…" />
        {state.fieldErrors.description?.map((e) => <p key={e} className="mt-1 text-sm text-rose-700">{e}</p>)}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="add-subject" className="mb-1 block text-sm font-semibold">Môn học <span className="text-rose-600">*</span></label>
          <select id="add-subject" name="subjectId" required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
            <option value="">— Chọn môn học —</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
          {state.fieldErrors.subjectId?.map((e) => <p key={e} className="mt-1 text-sm text-rose-700">{e}</p>)}
        </div>
        <div>
          <label htmlFor="add-due" className="mb-1 block text-sm font-semibold">Hạn nộp (giờ VN) <span className="text-rose-600">*</span></label>
          <input id="add-due" name="dueAt" type="datetime-local" required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" />
          {state.fieldErrors.dueAt?.map((e) => <p key={e} className="mt-1 text-sm text-rose-700">{e}</p>)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-50">
          {pending ? "Đang thêm…" : "Thêm deadline"}
        </button>
        {state.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
        {state.message && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updateCompletion } from "@/actions/completion";

export default function CompletionForm({ deadlineId, completed }: { deadlineId: string; completed: boolean }) {
  const [state, action, pending] = useActionState(updateCompletion, { error: "", message: "" });
  return <form action={action} className="mt-4 space-y-2">
    <input type="hidden" name="deadlineId" value={deadlineId} />
    <input type="hidden" name="completed" value={String(!completed)} />
    <button type="submit" disabled={pending} aria-label={`${completed ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành"} ${deadlineId}`} className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-50 ${completed ? "border border-slate-300 text-slate-700 hover:bg-slate-100" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
      {pending ? "Đang lưu…" : completed ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
    </button>
    {state.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
    <p role="status" className="text-sm text-emerald-700">{state.message}</p>
  </form>;
}

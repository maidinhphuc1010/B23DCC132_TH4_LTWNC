"use client";

import { useActionState, useState } from "react";
import { deleteDeadline, type DeadlineActionState } from "@/actions/deadline";

const initial: DeadlineActionState = { error: "", fieldErrors: {}, message: "" };

export default function DeleteDeadlineButton({ deadlineId, title }: { deadlineId: string; title: string }) {
  const [state, action, pending] = useActionState(deleteDeadline, initial);
  const [confirming, setConfirming] = useState(false);

  if (state.message) {
    return <p role="status" className="text-sm text-emerald-700">{state.message}</p>;
  }

  if (!confirming) {
    return (
      <div className="space-y-1">
        <button type="button" onClick={() => setConfirming(true)} className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
          Xóa
        </button>
        {state.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
      <p className="text-sm font-semibold text-rose-800">Xóa &ldquo;{title}&rdquo;?</p>
      <p className="text-xs text-rose-600">Thao tác này không thể hoàn tác. Completions liên quan cũng sẽ bị xóa.</p>
      <form action={action} className="flex gap-2">
        <input type="hidden" name="deadlineId" value={deadlineId} />
        <button type="submit" disabled={pending} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-50">
          {pending ? "Đang xóa…" : "Xác nhận xóa"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50">
          Hủy
        </button>
      </form>
      {state.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { deadlineTiming, statusLabels } from "@/lib/deadline-time";

export function useDeadlineClock(initialNow: number) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const first = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => { clearTimeout(first); clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  return now;
}

export function TimingBadge({ dueAt, now }: { dueAt: string; now: number }) {
  const { status, countdown } = deadlineTiming(dueAt, now);
  const color = status === "overdue" ? "bg-rose-50 text-rose-700" : status === "soon" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{statusLabels[status]} · {countdown}</span>;
}

export default function DeadlineCountdown({ dueAt, initialNow }: { dueAt: string; initialNow: number }) {
  const now = useDeadlineClock(initialNow);
  return <TimingBadge dueAt={dueAt} now={now} />;
}

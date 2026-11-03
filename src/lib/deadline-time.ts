export type DeadlineStatus = "open" | "soon" | "overdue";
const day = 86_400_000;
// Vietnam is UTC+7 year-round, without daylight saving time.
const vietnamDay = (time: number) => Math.floor((time + 7 * 3_600_000) / day);
export function deadlineTiming(dueAt: string, now: number) {
  const due = Date.parse(dueAt);
  const days = vietnamDay(due) - vietnamDay(now);
  const status: DeadlineStatus = now >= due ? "overdue" : days <= 2 ? "soon" : "open";
  const countdown = days === 0 ? "Hết hạn hôm nay" : days > 0 ? `Còn ${days} ngày` : `Quá hạn ${-days} ngày`;
  return { status, countdown };
}
export const statusLabels: Record<DeadlineStatus, string> = {
  open: "Còn hạn", soon: "Sắp hết hạn", overdue: "Quá hạn",
};

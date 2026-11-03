export type DeadlineStatus = "open" | "soon" | "overdue";
const day = 86_400_000;
// Vietnam is UTC+7 year-round, without daylight saving time.
const vietnamDay = (time: number) => Math.floor((time + 7 * 3_600_000) / day);
export function deadlineTiming(dueAt: string, now: number) {
  const due = Date.parse(dueAt);
  const days = vietnamDay(due) - vietnamDay(now);
  const status: DeadlineStatus = now >= due ? "overdue" : days <= 2 ? "soon" : "open";
  const remaining = Math.max(0, Math.ceil((due - now) / 1000));
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const countdown = status === "overdue"
    ? (days === 0 ? "Đã hết hạn hôm nay" : `Quá hạn ${-days} ngày`)
    : days === 0 ? `Còn ${hours} giờ ${minutes} phút ${seconds} giây` : `Còn ${days} ngày`;
  return { status, countdown };
}
export const statusLabels: Record<DeadlineStatus, string> = {
  open: "Còn hạn", soon: "Sắp hết hạn", overdue: "Quá hạn",
};

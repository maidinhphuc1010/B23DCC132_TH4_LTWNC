import DeadlineBrowser from "@/components/deadline-browser";
import { getDeadlines, getSubjects } from "@/lib/repository";

export const revalidate = 60;

export default async function DeadlinesPage() {
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  return <section className="space-y-8"><div><p className="text-sm font-semibold text-indigo-600">Kế hoạch học tập</p><h1 className="mt-2 text-4xl font-bold">Tất cả deadline</h1><p className="mt-4 text-slate-600">Lọc theo môn học và hạn nộp để tìm bài cần ưu tiên. Trạng thái ở đây không phải tiến độ hoàn thành cá nhân.</p></div><DeadlineBrowser deadlines={deadlines} subjects={subjects} initialNow={new Date().getTime()} /></section>;
}

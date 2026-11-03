import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck2 } from "lucide-react";
import SubjectCard from "@/components/subject-card";
import DeadlineList from "@/components/deadline-list";
import { getPublicData } from "@/lib/public-data";

export default async function HomeContent() {
  const { subjects, deadlines, generatedAt } = await getPublicData();
  const upcoming = deadlines.filter((d) => Date.parse(d.dueAt) >= Date.parse(generatedAt)).slice(0, 4);
  return <div className="space-y-16 sm:space-y-20">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:p-12 lg:p-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Không bỏ lỡ một hạn nộp nào</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Học có kế hoạch.<br /><span className="text-indigo-300">Nộp bài đúng hẹn.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">Class Deadline Hub tập hợp môn học và hạn nộp bài của lớp trong một nơi. Dễ dàng tìm bài cần làm, sắp xếp thời gian và chủ động hơn mỗi ngày.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/deadlines" className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold hover:bg-indigo-400">Khám phá deadline <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="#subjects" className="rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold hover:bg-slate-800">Xem môn học</Link>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6"><BookOpen className="mb-4 text-indigo-300" aria-hidden="true" /><dt className="text-sm text-slate-300">Môn học trong lớp</dt><dd className="mt-2 text-4xl font-bold">{subjects.length}</dd></div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6"><CalendarCheck2 className="mb-4 text-emerald-300" aria-hidden="true" /><dt className="text-sm text-slate-300">Deadline được tổng hợp</dt><dd className="mt-2 text-4xl font-bold">{deadlines.length}</dd></div>
        </dl>
      </div>
    </section>
    <section id="subjects" aria-labelledby="subjects-heading" className="scroll-mt-6">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Góc học tập</p>
      <h2 id="subjects-heading" className="mt-2 text-3xl font-bold tracking-tight">Môn học của lớp</h2>
      <p className="mt-3 text-slate-600">Chọn môn học để xem nội dung và những mốc thời gian cần nhớ.</p>
      <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{subjects.map((subject) => <li key={subject.id}><SubjectCard subject={subject} count={deadlines.filter((d) => d.subjectId === subject.id).length} /></li>)}</ul>
    </section>
    <section aria-labelledby="upcoming-heading">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Ưu tiên tiếp theo</p><h2 id="upcoming-heading" className="mt-2 text-3xl font-bold tracking-tight">Deadline sắp đến hạn</h2><p className="mt-3 text-slate-600">Tối đa 4 hạn nộp gần nhất chưa quá hạn tại thời điểm cập nhật.</p></div><Link href="/deadlines" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline">Tất cả deadline <ArrowRight size={18} aria-hidden="true" /></Link></div>
      {upcoming.length ? <DeadlineList deadlines={upcoming} subjects={subjects} /> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Chưa có deadline sắp tới. Bạn có thể xem lại toàn bộ bài tập trong danh sách deadline.</p>}
      <p className="mt-4 text-xs leading-6 text-slate-500">Bản tĩnh cập nhật lúc <time dateTime={generatedAt}>{new Date(generatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time> (giờ Việt Nam). Danh sách không cập nhật theo thời gian thực.</p>
    </section>
  </div>;
}

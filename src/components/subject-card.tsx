import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Subject } from "@/types";

export default function SubjectCard({ subject, count }: { subject: Subject; count: number }) {
  return <Link href={`/subjects/${subject.slug}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg motion-reduce:transform-none">
    <div className="mb-6 flex items-center justify-between">
      <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><BookOpen size={23} aria-hidden="true" /></span>
      <span className="text-xs font-semibold tracking-wider text-slate-500">{subject.code}</span>
    </div>
    <h3 className="text-lg font-bold text-slate-950 group-hover:text-indigo-700">{subject.name}</h3>
    <p className="mt-3 grow text-sm leading-6 text-slate-600">{subject.description}</p>
    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold">
      <span className="text-slate-500">{count} deadline</span><span className="inline-flex items-center gap-1 text-indigo-700">Xem môn học <ArrowUpRight size={17} aria-hidden="true" /></span>
    </div>
  </Link>;
}

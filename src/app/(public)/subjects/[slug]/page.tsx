import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import DeadlineList from "@/components/deadline-list";
import { getSubjects } from "@/lib/repository";
import { getPublicData } from "@/lib/public-data";

import { publicMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const subject = (await getSubjects()).find((item) => item.slug === slug);
  if (!subject) notFound();
  return publicMetadata(subject.name, subject.description, `/subjects/${encodeURIComponent(subject.slug)}`);
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getSubjects()).map(({ slug }) => ({ slug }));
}

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { subjects, deadlines } = await getPublicData();
  const subject = subjects.find((item) => item.slug === slug);
  if (!subject) notFound();
  const subjectDeadlines = deadlines.filter((item) => item.subjectId === subject.id);
  return <div className="space-y-10">
    <Link href="/#subjects" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft size={17} aria-hidden="true" />Tất cả môn học</Link>
    <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-7 sm:p-12">
      <BookOpen size={32} className="mb-6 text-indigo-600" aria-hidden="true" />
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">{subject.code} · Thông tin môn học</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{subject.name}</h1>
      <p className="mt-5 max-w-2xl leading-8 text-slate-600">{subject.description}</p>
      <p className="mt-6 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700">{subjectDeadlines.length} deadline</p>
    </section>
    <section aria-labelledby="deadline-heading"><h2 id="deadline-heading" className="text-2xl font-bold">Deadline môn học</h2><p className="mb-6 mt-2 text-sm text-slate-600">Sắp xếp theo hạn nộp tăng dần · Giờ Việt Nam (UTC+7)</p><DeadlineList deadlines={subjectDeadlines} /></section>
  </div>;
}

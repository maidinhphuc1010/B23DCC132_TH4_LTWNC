import Link from "next/link";
import { notFound } from "next/navigation";
import DeadlineCountdown from "@/components/deadline-countdown";
import { getDeadlines, getSubjects } from "@/lib/repository";
import { getDeadlineDetail } from "@/lib/deadline-detail";
import { absoluteUrl, publicMetadata, safeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const deadline = await getDeadlineDetail((await params).id);
  if (!deadline) notFound();
  const path = `/deadlines/${encodeURIComponent(deadline.id)}`;
  const metadata = publicMetadata(deadline.title, deadline.description.slice(0, 160), path);
  // File-based OG metadata supplies the versioned image URL. Twitter falls back to it.
  return { ...metadata, twitter: { ...metadata.twitter, card: "summary_large_image" as const } };
}

export const revalidate = 60;
export const dynamicParams = true;
// Permit on-demand ISR for paths absent from the build-time parameter list.
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getDeadlines()).map(({ id }) => ({ id }));
}

export default async function DeadlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deadline = await getDeadlineDetail(id);
  // Compatibility URL requested by the assignment; keep existing IDs and links intact.

  if (!deadline) notFound();
  const subject = (await getSubjects()).find((s) => s.id === deadline.subjectId);
  const breadcrumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Trang chủ", item: absoluteUrl("/") },
      { name: "Deadline", item: absoluteUrl("/deadlines") },
      { name: deadline.title, item: absoluteUrl(`/deadlines/${encodeURIComponent(deadline.id)}`) },
    ].map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };
  return <article className="mx-auto max-w-3xl space-y-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
    <Link href="/deadlines" className="text-sm font-semibold text-indigo-700 hover:underline">← Tất cả deadline</Link>
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <DeadlineCountdown dueAt={deadline.dueAt} initialNow={new Date().getTime()} />
      <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{deadline.title}</h1>
      {subject && <Link href={`/subjects/${subject.slug}`} className="mt-4 inline-block font-semibold text-indigo-700 hover:underline">{subject.name}</Link>}
      <p className="mt-6 whitespace-pre-wrap leading-8 text-slate-600">{deadline.description}</p>
      <dl className="mt-8 space-y-5 border-t border-slate-100 pt-6">{[["Hạn nộp", deadline.dueAt], ["Ngày tạo", deadline.createdAt]].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold"><time dateTime={value}>{new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time> (UTC+7)</dd></div>)}</dl>
    </div>
  </article>;
}

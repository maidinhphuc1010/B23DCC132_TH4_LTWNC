import type { MetadataRoute } from "next";
import { getDeadlines, getSubjects } from "@/lib/repository";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [subjects, deadlines] = await Promise.all([getSubjects(), getDeadlines()]);
  return [
    { url: absoluteUrl("/"), priority: 1 },
    { url: absoluteUrl("/deadlines"), priority: 0.9 },
    ...subjects.map((subject) => ({ url: absoluteUrl(`/subjects/${encodeURIComponent(subject.slug)}`), priority: 0.8 })),
    ...deadlines.map((deadline) => ({ url: absoluteUrl(`/deadlines/${encodeURIComponent(deadline.id)}`), lastModified: new Date(deadline.createdAt), priority: 0.7 })),
  ];
}

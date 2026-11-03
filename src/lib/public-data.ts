import "server-only";
import { getSubjects, getDeadlines } from "@/lib/repository";

// Build-time snapshot for SSG pages. Never include users or completions.
// Rebuild the application to publish JSON changes and refresh upcoming deadlines.
export async function getPublicData() {
  const [subjects, deadlines] = await Promise.all([getSubjects(), getDeadlines()]);
  return { subjects, deadlines, generatedAt: new Date().toISOString() };
}

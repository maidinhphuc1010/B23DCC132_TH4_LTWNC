import "server-only";
import path from "node:path";
import { readDatabase, updateDatabase } from "./json-store.mjs";
import type { Database } from "@/types";
import { mergeGitHubUser } from "@/lib/github-user";

// Resolve from the Next.js project root, including bundled production code.
const file = path.join(process.cwd(), "data", "db.json");
const read = (): Promise<Database> => readDatabase(file);

export async function getSubjects() { return (await read()).subjects; }
export async function getSubjectBySlug(slug: string) {
  return (await read()).subjects.find((subject) => subject.slug === slug);
}
export async function getDeadlines(subjectId?: string) {
  return (await read()).deadlines
    .filter((deadline) => !subjectId || deadline.subjectId === subjectId)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}
export async function getDeadlineById(id: string) {
  return (await read()).deadlines.find((deadline) => deadline.id === id);
}
// Contains passwordHash: only use on the server, never pass to Client Components.
export async function getUserById(id: string) {
  return (await read()).users.find((user) => user.id === id);
}
export async function getUserByEmail(email: string) {
  return (await read()).users.find((user) => user.passwordHash !== null && user.email?.toLowerCase() === email.trim().toLowerCase());
}
export async function getCompletionsByUserId(userId: string) {
  return (await read()).completions.filter((completion) => completion.userId === userId);
}
// Trusted server-only primitives, not Server Actions. Future callers must authorize first.
export async function updateRepository(update: (db: Database) => Database | Promise<Database>) {
  return updateDatabase(async (db: Database | null) => {
    if (!db) throw new Error("Chưa có dữ liệu. Chạy npm run seed trước.");
    return update(db);
  }, file) as Promise<Database>;
}
export async function saveGitHubUser(identity: Parameters<typeof mergeGitHubUser>[1]) {
  const db = await updateRepository((db) => { mergeGitHubUser(db, identity); return db; });
  return db.users.find((user) => user.id === `github:${identity.accountId}`)!;
}

export async function setCompletion(userId: string, deadlineId: string, completed: boolean) {
  await updateRepository((db) => {
    if (!db.users.some((u) => u.id === userId) || !db.deadlines.some((d) => d.id === deadlineId)) {
      throw new Error("Người dùng hoặc deadline không tồn tại.");
    }
    const existing = db.completions.find((c) => c.userId === userId && c.deadlineId === deadlineId);
    db.completions = db.completions.filter((c) => c.userId !== userId || c.deadlineId !== deadlineId);
    if (completed) db.completions.push(existing ?? { userId, deadlineId, completedAt: new Date().toISOString() });
    return db;
  });
}

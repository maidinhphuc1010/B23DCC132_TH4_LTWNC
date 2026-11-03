import { z } from "zod";

const id = z.string().min(1);
const date = z.iso.datetime({ offset: true });
export const roleSchema = z.enum(["guest", "user", "admin"]);
export const subjectSchema = z.object({
  id, slug: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1),
  code: z.string().min(1), description: z.string().min(1),
}).strict();
export const deadlineSchema = z.object({
  id, title: z.string().min(1), description: z.string().min(1),
  subjectId: id, dueAt: date, createdAt: date,
}).strict();
export const userSchema = z.object({
  id, name: z.string().min(1), email: z.email(),
  passwordHash: z.string().regex(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/),
  role: roleSchema, createdAt: date,
}).strict();
export const completionSchema = z.object({ userId: id, deadlineId: id, completedAt: date }).strict();
export const databaseSchema = z.object({
  subjects: z.array(subjectSchema), deadlines: z.array(deadlineSchema),
  users: z.array(userSchema), completions: z.array(completionSchema),
}).strict().superRefine((db, ctx) => {
  const error = (message) => ctx.addIssue({ code: "custom", message });
  const unique = (values, label) => {
    if (new Set(values).size !== values.length) error(`Trùng ${label}`);
  };
  for (const table of ["subjects", "deadlines", "users"]) {
    unique(db[table].map((item) => item.id), `${table}.id`);
  }
  unique(db.subjects.map((s) => s.slug), "subject.slug");
  unique(db.users.map((u) => u.email.toLowerCase()), "user.email");
  unique(db.completions.map((c) => JSON.stringify([c.userId, c.deadlineId])), "completion");
  for (const d of db.deadlines) {
    if (!db.subjects.some((s) => s.id === d.subjectId)) error("Môn học không tồn tại");
  }
  for (const c of db.completions) {
    if (!db.users.some((u) => u.id === c.userId)) error("Người dùng không tồn tại");
    if (!db.deadlines.some((d) => d.id === c.deadlineId)) error("Deadline không tồn tại");
  }
});

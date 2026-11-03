import type { z } from "zod";
import type { completionSchema, databaseSchema, deadlineSchema, roleSchema, subjectSchema, userSchema } from "@/lib/db-schema.mjs";

export type Role = z.infer<typeof roleSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Deadline = z.infer<typeof deadlineSchema>;
export type User = z.infer<typeof userSchema>;
export type Completion = z.infer<typeof completionSchema>;
export type Database = z.infer<typeof databaseSchema>;
export type { Action } from "@/lib/permissions";

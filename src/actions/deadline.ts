"use server";

import { z } from "zod";
import { requirePermission } from "@/lib/require-auth";
import { getSubjects, updateRepository } from "@/lib/repository";
import { revalidateDeadlines } from "@/lib/revalidate-deadlines";
import { revalidatePath } from "next/cache";

// ── Schemas ──────────────────────────────────────────────────────────
const addSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống.").max(500, "Tiêu đề quá dài."),
  description: z.string().trim().min(1, "Mô tả không được để trống.").max(2000, "Mô tả quá dài."),
  subjectId: z.string().trim().min(1, "Vui lòng chọn môn học."),
  dueAt: z.string().trim().min(1, "Vui lòng nhập ngày giờ hạn nộp."),
});

const deleteSchema = z.object({
  deadlineId: z.string().trim().min(1, "Thiếu ID deadline.").max(200),
});

export type DeadlineActionState = { error: string; fieldErrors: Record<string, string[]>; message: string };
const blank: DeadlineActionState = { error: "", fieldErrors: {}, message: "" };

function revalidateAll(id: string) {
  revalidateDeadlines(id);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

// ── Add Deadline ─────────────────────────────────────────────────────
export async function addDeadline(_prev: DeadlineActionState, form: FormData): Promise<DeadlineActionState> {
  await requirePermission("deadline:create", "/admin");

  const parsed = addSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    subjectId: form.get("subjectId"),
    dueAt: form.get("dueAt"),
  });
  if (!parsed.success) {
    return { ...blank, error: "Dữ liệu không hợp lệ.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Validate subjectId exists
  const subjects = await getSubjects();
  if (!subjects.some((s) => s.id === parsed.data.subjectId)) {
    return { ...blank, error: "Môn học không tồn tại.", fieldErrors: { subjectId: ["Môn học không tồn tại trong hệ thống."] } };
  }

  // Parse dueAt: input type="datetime-local" gives "YYYY-MM-DDTHH:mm", convert to +07:00
  const dueDate = new Date(`${parsed.data.dueAt}:00+07:00`);
  if (isNaN(dueDate.getTime())) {
    return { ...blank, error: "Ngày giờ không hợp lệ.", fieldErrors: { dueAt: ["Ngày giờ hạn nộp không đúng định dạng."] } };
  }
  const dueAtFormatted = `${parsed.data.dueAt}:00+07:00`;
  // Validate it parses correctly
  if (isNaN(Date.parse(dueAtFormatted))) {
    return { ...blank, error: "Ngày giờ không hợp lệ.", fieldErrors: { dueAt: ["Ngày giờ hạn nộp không đúng định dạng."] } };
  }

  const now = new Date();
  const createdAt = now.toISOString().replace("Z", "+07:00").replace(/\.\d{3}/, "");
  // Generate a unique ID
  const id = `dl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    await updateRepository((db) => {
      if (db.deadlines.some((d) => d.id === id)) {
        throw new Error("Trùng ID deadline.");
      }
      db.deadlines.push({
        id,
        title: parsed.data.title,
        description: parsed.data.description,
        subjectId: parsed.data.subjectId,
        dueAt: dueAtFormatted,
        createdAt,
      });
      return db;
    });
  } catch (err) {
    return { ...blank, error: `Không thể lưu deadline: ${err instanceof Error ? err.message : "Lỗi không xác định."}` };
  }

  revalidateAll(id);
  return { ...blank, message: `Đã thêm deadline "${parsed.data.title}" thành công.` };
}

// ── Delete Deadline ──────────────────────────────────────────────────
export async function deleteDeadline(_prev: DeadlineActionState, form: FormData): Promise<DeadlineActionState> {
  await requirePermission("deadline:delete", "/admin");

  const parsed = deleteSchema.safeParse({ deadlineId: form.get("deadlineId") });
  if (!parsed.success) {
    return { ...blank, error: "Dữ liệu không hợp lệ.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { deadlineId } = parsed.data;

  try {
    await updateRepository((db) => {
      const index = db.deadlines.findIndex((d) => d.id === deadlineId);
      if (index === -1) throw new Error("Deadline không tồn tại.");
      db.deadlines.splice(index, 1);
      // Also remove related completions
      db.completions = db.completions.filter((c) => c.deadlineId !== deadlineId);
      return db;
    });
  } catch (err) {
    return { ...blank, error: `Không thể xóa: ${err instanceof Error ? err.message : "Lỗi không xác định."}` };
  }

  revalidateAll(deadlineId);
  return { ...blank, message: "Đã xóa deadline thành công." };
}

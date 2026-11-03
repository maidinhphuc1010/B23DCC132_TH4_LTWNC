"use server";

import { z } from "zod";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { can, type Action } from "@/lib/permissions";
import { getUserById, updateRepository } from "@/lib/repository";
import { revalidateDeadlines } from "@/lib/revalidate-deadlines";
import { revalidatePath } from "next/cache";

// ── Schemas ──────────────────────────────────────────────────────────
const addSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống.").max(500, "Tiêu đề quá dài."),
  description: z.string().trim().min(1, "Mô tả không được để trống.").max(2000, "Mô tả quá dài."),
  subjectId: z.string().trim().min(1, "Vui lòng chọn môn học."),
  dueAt: z.iso.datetime({ local: true, precision: -1, error: "Ngày giờ hạn nộp không hợp lệ." }),
});

const deleteSchema = z.object({
  deadlineId: z.string().trim().min(1, "Thiếu ID deadline.").max(200),
});

export type DeadlineActionState = { error: string; fieldErrors: Record<string, string[]>; message: string };
const blank: DeadlineActionState = { error: "", fieldErrors: {}, message: "" };

async function authorize(action: Action): Promise<string> {
  try {
    const session = await auth();
    if (!session?.user?.id) return "Vui lòng đăng nhập để thực hiện thao tác này.";
    const user = await getUserById(session.user.id);
    if (!user || !can(user.role, action)) return "Bạn không có quyền thực hiện thao tác này. Chỉ admin được thêm/xóa deadline.";
    return "";
  } catch (error) {
    console.error("Deadline authorization failed", error);
    return "Không thể đọc dữ liệu xác thực. Vui lòng thử lại.";
  }
}

function revalidateAll(id: string) {
  revalidateDeadlines(id);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

// ── Add Deadline ─────────────────────────────────────────────────────
export async function addDeadline(_prev: DeadlineActionState, form: FormData): Promise<DeadlineActionState> {
  const error = await authorize("deadline:create");
  if (error) return { ...blank, error };
  if (!(form instanceof FormData)) return { ...blank, error: "Dữ liệu biểu mẫu không hợp lệ." };

  const parsed = addSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    subjectId: form.get("subjectId"),
    dueAt: form.get("dueAt"),
  });
  if (!parsed.success) {
    return { ...blank, error: "Dữ liệu không hợp lệ.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dueAtFormatted = `${parsed.data.dueAt}:00+07:00`;
  const createdAt = new Date().toISOString();
  const id = `dl-${randomUUID()}`;

  try {
    await updateRepository((db) => {
      if (!db.subjects.some((subject) => subject.id === parsed.data.subjectId)) {
        throw new Error("Môn học không tồn tại.");
      }
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
  const error = await authorize("deadline:delete");
  if (error) return { ...blank, error };
  if (!(form instanceof FormData)) return { ...blank, error: "Dữ liệu biểu mẫu không hợp lệ." };

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

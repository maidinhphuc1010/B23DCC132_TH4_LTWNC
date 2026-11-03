"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-auth";
import { getDeadlineById, setCompletion } from "@/lib/repository";

const schema = z.object({
  deadlineId: z.string().trim().min(1).max(200),
  completed: z.enum(["true", "false"]).transform((value) => value === "true"),
});
export type CompletionState = { error: string; message: string };

export async function updateCompletion(_previous: CompletionState, form: FormData): Promise<CompletionState> {
  const user = await requirePermission("completion:update");
  const parsed = schema.safeParse({ deadlineId: form.get("deadlineId"), completed: form.get("completed") });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ. Vui lòng tải lại trang và thử lại.", message: "" };
  try {
    if (!await getDeadlineById(parsed.data.deadlineId)) return { error: "Deadline không còn tồn tại.", message: "" };
    await setCompletion(user.id, parsed.data.deadlineId, parsed.data.completed);
  } catch {
    return { error: "Không thể lưu trạng thái. Vui lòng thử lại.", message: "" };
  }
  revalidatePath("/dashboard");
  return { error: "", message: parsed.data.completed ? "Đã đánh dấu hoàn thành." : "Đã chuyển về chưa hoàn thành." };
}

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDeadlineDetail } from "@/lib/deadline-detail";
import { getSubjects } from "@/lib/repository";

export const alt = "Deadline, môn học và hạn nộp — Class Deadline Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const deadline = await getDeadlineDetail((await params).id);
  if (!deadline) return new Response("Deadline không tồn tại", { status: 404 });
  const subject = (await getSubjects()).find((item) => item.id === deadline.subjectId);
  const font = await readFile(path.join(process.cwd(), "public/fonts/NotoSans-Regular.ttf"));
  const title = deadline.title.length > 150 ? `${deadline.title.slice(0, 147)}…` : deadline.title;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(135deg, #0f172a, #312e81)", color: "white", fontFamily: "Noto Sans" }}>
      <div style={{ display: "flex", fontSize: 26, color: "#c7d2fe" }}>CLASS DEADLINE HUB</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 28, color: "#a5b4fc" }}>{subject?.name ?? "Môn học"}</div>
        <div style={{ display: "flex", fontSize: title.length > 90 ? 40 : 52, lineHeight: 1.3, overflowWrap: "anywhere" }}>{title}</div>
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#6ee7b7", borderTop: "2px solid #6366f1", paddingTop: 24 }}>
        Hạn nộp: {new Date(deadline.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })} (UTC+7)
      </div>
    </div>,
    { ...size, fonts: [{ name: "Noto Sans", data: font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer, weight: 400, style: "normal" }] },
  );
}

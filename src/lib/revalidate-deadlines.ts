import "server-only";
import { revalidatePath } from "next/cache";

// Call ONLY from an authorized admin Server Action/Route Handler, AFTER a successful write.
// Not a public endpoint or Server Action: authentication is implemented in the next phase.
export function revalidateDeadlines(id: string) {
  revalidatePath("/deadlines");
  revalidatePath("/sitemap.xml");
  // Invalidate nested file-based image routes too (Next may suffix their URL).
  revalidatePath("/deadlines/[id]", "layout");
  revalidatePath(`/deadlines/${encodeURIComponent(id)}`);
  if (id === "dl-001" || id === "1") revalidatePath("/deadlines/1");
}

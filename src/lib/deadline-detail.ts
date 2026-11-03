import "server-only";
import { cache } from "react";
import { getDeadlineById } from "@/lib/repository";

// Request-local memoization keeps metadata and page content consistent without adding a data cache.
export const getDeadlineDetail = cache(async (id: string) =>
  await getDeadlineById(id) ?? (id === "1" ? await getDeadlineById("dl-001") : undefined)
);

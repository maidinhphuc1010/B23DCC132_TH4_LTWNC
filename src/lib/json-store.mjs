import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { databaseSchema } from "./db-schema.mjs";

// Node-only shared storage used by the server repository and CLI scripts.
export const databasePath = path.join(process.cwd(), "data", "db.json");

export async function readDatabase(file = databasePath) {
  return databaseSchema.parse(JSON.parse(await readFile(/* turbopackIgnore: true */ file, "utf8")));
}

export async function updateDatabase(update, file = databasePath) {
  await mkdir(path.dirname(file), { recursive: true });
  const lockPath = `${file}.lock`;
  let lock;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      lock = await open(lockPath, "wx");
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  if (!lock) throw new Error(`Không lấy được khóa ${lockPath}. Kiểm tra tiến trình đang ghi hoặc khóa còn sót sau sự cố.`);
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    let current = null;
    try { current = await readDatabase(file); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    const next = databaseSchema.parse(await update(current));
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(next, null, 2)}\n`, "utf8");
      await handle.sync();
    } finally { await handle.close(); }
    await rename(temporary, file);
    return next;
  } finally {
    await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; });
    await lock.close();
    await unlink(lockPath);
  }
}

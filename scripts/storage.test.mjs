import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import { readDatabase, updateDatabase } from "../src/lib/json-store.mjs";

test("Seed có đúng dữ liệu và mật khẩu bcrypt", async () => {
  const db = await readDatabase();
  assert.equal(db.subjects.length, 4);
  assert.equal(db.deadlines.length, 12);
  assert.equal(db.users.length, 2);
  for (const [email, password, role] of [["admin@ptit.edu.vn", "admin123", "admin"], ["sv@ptit.edu.vn", "sv123456", "user"]]) {
    const user = db.users.find((u) => u.email === email);
    assert.equal(user.role, role);
    assert.ok(await bcrypt.compare(password, user.passwordHash));
    assert.ok(!JSON.stringify(db).includes(password));
  }
});

test("Ghi đồng thời không mất dữ liệu, completion riêng và từ chối dữ liệu lỗi", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "deadline-hub-"));
  const file = path.join(dir, "db.json");
  try {
    const seed = await readDatabase();
    seed.completions = [];
    await updateDatabase(() => seed, file);
    await Promise.all(seed.users.map((user) => updateDatabase((db) => {
      db.completions.push({ userId: user.id, deadlineId: seed.deadlines[0].id, completedAt: new Date().toISOString() });
      return db;
    }, file)));
    assert.equal((await readDatabase(file)).completions.length, 2);
    const before = await readFile(file, "utf8");
    await assert.rejects(updateDatabase((db) => { db.completions.push(db.completions[0]); return db; }, file));
    assert.equal(await readFile(file, "utf8"), before);
    await assert.rejects(updateDatabase((db) => { db.deadlines[0].subjectId = "missing"; return db; }, file));
    assert.equal(await readFile(file, "utf8"), before);
    await updateDatabase((db) => { db.completions = db.completions.filter((c) => c.userId !== seed.users[0].id); return db; }, file);
    assert.equal((await readDatabase(file)).completions[0].userId, seed.users[1].id);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

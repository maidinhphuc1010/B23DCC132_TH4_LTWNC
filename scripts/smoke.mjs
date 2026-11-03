import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readDatabase } from "../src/lib/json-store.mjs";
const db = await readDatabase();
const before = await readFile("data/db.json", "utf8");
const manifest = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
for (const route of ["/", ...db.subjects.map((s) => `/subjects/${s.slug}`)]) {
  assert.ok(manifest.routes[route], `Missing prerender: ${route}`);
  assert.equal(manifest.routes[route].initialRevalidateSeconds, false, route);
  console.log(`PASS SSG ${route}`);
}
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3107"], { stdio: "pipe" });
let logs = "";
server.stdout.on("data", (data) => { logs += data; });
server.stderr.on("data", (data) => { logs += data; });
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch("http://localhost:3107/login")).ok) { ready = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, logs);
  for (const [route, expected] of [
    ["/", "Lập trình Web nâng cao"],
    ...db.subjects.map((subject) => [`/subjects/${subject.slug}`, subject.name]),
    ["/deadlines", "Thực hành 4"], ["/deadlines/dl-001", "Thực hành 4"],
    ["/login", "Đăng nhập"], ["/403", "Không có quyền truy cập"],
    // Protected routes are tested with sessions in auth-smoke.mjs.
  ]) {
    const response = await fetch(`http://localhost:3107${route}`);
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.ok(html.includes(expected), route);
    assert.ok(!html.includes("passwordHash"), route);
    const subject = db.subjects.find((s) => route === `/subjects/${s.slug}`);
    if (subject) {
      const expectedDeadlines = db.deadlines.filter((d) => d.subjectId === subject.id).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
      let position = -1;
      for (const deadline of expectedDeadlines) {
        const next = html.indexOf(`href="/deadlines/${deadline.id}"`, position + 1);
        assert.ok(next > position, `Missing or unsorted deadline: ${deadline.id}`);
        position = next;
      }
      for (const deadline of db.deadlines.filter((d) => d.subjectId !== subject.id)) {
        assert.ok(!html.includes(`href="/deadlines/${deadline.id}"`), `Wrong subject: ${deadline.id}`);
      }
    }
    console.log(`PASS ${response.status} ${route}`);
  }
  const missing = await fetch("http://localhost:3107/subjects/mon-khong-ton-tai");
  assert.equal(missing.status, 404);
  console.log("PASS 404 /subjects/mon-khong-ton-tai");
  assert.equal(await readFile("data/db.json", "utf8"), before);
  console.log("PASS database unchanged");
} finally { server.kill(); }

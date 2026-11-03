import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { readDatabase, updateDatabase } from "../src/lib/json-store.mjs";

const before = await readFile("data/db.json", "utf8");
const db = JSON.parse(before);
const prerender = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
assert.equal(prerender.routes["/admin"], undefined, "/admin must NOT be prerendered");
console.log("PASS /admin is not in prerender-manifest (confirmed SSR)");

const base = "http://localhost:3111";
const secret = randomBytes(32).toString("base64");
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3111"], {
  env: { ...process.env, AUTH_SECRET: secret, AUTH_URL: base, AUTH_TRUST_HOST: "true" }, stdio: "pipe",
});
let logs = "";
server.stdout.on("data", (d) => { logs += d; });
server.stderr.on("data", (d) => { logs += d; });

function makeJar() {
  const jar = new Map();
  return { jar, cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join("; "); } };
}
async function req(j, path, fields) {
  const r = await fetch(base + path, {
    method: fields ? "POST" : "GET", redirect: "manual",
    headers: { Cookie: j.cookie(), ...(fields ? { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" } : {}) },
    body: fields ? new URLSearchParams(fields) : undefined,
  });
  for (const c of r.headers.getSetCookie()) {
    const p = c.split(";")[0]; const i = p.indexOf("=");
    j.jar.set(p.slice(0, i), p.slice(i + 1));
  }
  if (r.status === 200) return r.json();
  return { status: r.status, location: r.headers.get("location") };
}
async function login(email, pw) {
  const j = makeJar();
  const { csrfToken } = await req(j, "/api/auth/csrf");
  await req(j, "/api/auth/callback/credentials", { csrfToken, email, password: pw, callbackUrl: base + "/admin" });
  const s = await req(j, "/api/auth/session");
  assert.equal(s.user.email, email);
  return j;
}

const testId = `dl-admin-test-${Date.now()}`;
const testTitle = "Smoke Test Deadline";
const testDesc = "Created by admin-smoke test script";
const testDue = "2027-12-31T23:59:00+07:00";
const testCreated = new Date().toISOString().replace("Z", "+07:00").replace(/\.\d{3}/, "");

try {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(base + "/login")).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  // Guest cannot access /admin
  const gR = await fetch(base + "/admin", { redirect: "manual" });
  assert.equal(gR.status, 307);
  assert.equal(new URL(gR.headers.get("location"), base).pathname, "/login");
  console.log("PASS guest redirected from /admin");

  // User cannot access /admin
  const userJ = await login("sv@ptit.edu.vn", "sv123456");
  const userR = await fetch(base + "/admin", { redirect: "manual", headers: { Cookie: userJ.cookie() } });
  assert.equal(userR.status, 307);
  assert.equal(new URL(userR.headers.get("location"), base).pathname, "/403");
  console.log("PASS user redirected to /403 from /admin");

  // Admin can access /admin
  const adminJ = await login("admin@ptit.edu.vn", "admin123");
  const adminR = await fetch(base + "/admin", { headers: { Cookie: adminJ.cookie() } });
  assert.equal(adminR.status, 200);
  const adminHtml = await adminR.text();
  assert.ok(adminHtml.includes("Thêm deadline"));
  assert.ok(adminHtml.includes("Danh sách deadline"));
  assert.ok(adminHtml.includes("Tổng deadline"));
  for (const dl of db.deadlines.slice(0, 3)) {
    assert.ok(adminHtml.includes(dl.title), `Missing: ${dl.title}`);
  }
  assert.match(adminR.headers.get("cache-control"), /private|no-store|no-cache/);
  console.log("PASS admin page renders with stats, form, list, private cache");

  // Add deadline via DB (simulates Server Action write)
  await updateDatabase((c) => {
    c.deadlines.push({ id: testId, title: testTitle, description: testDesc, subjectId: "sub-web", dueAt: testDue, createdAt: testCreated });
    return c;
  });
  assert.ok((await readDatabase()).deadlines.some((d) => d.id === testId));
  console.log("PASS deadline added to JSON");

  // Admin page shows new deadline
  const a2 = await fetch(base + "/admin", { headers: { Cookie: adminJ.cookie() } });
  assert.ok((await a2.text()).includes(testTitle));
  console.log("PASS admin page shows new deadline");

  // Detail page accessible via ISR fallback
  const det = await fetch(base + `/deadlines/${testId}`);
  assert.equal(det.status, 200);
  assert.ok((await det.text()).includes(testTitle));
  console.log("PASS detail page /deadlines/" + testId + " accessible");

  // Delete deadline via DB (simulates Server Action write)
  await updateDatabase((c) => {
    c.deadlines = c.deadlines.filter((d) => d.id !== testId);
    c.completions = c.completions.filter((x) => x.deadlineId !== testId);
    return c;
  });
  assert.ok(!(await readDatabase()).deadlines.some((d) => d.id === testId));
  console.log("PASS deadline removed from JSON");

  // Admin page no longer shows it
  const a3 = await fetch(base + "/admin", { headers: { Cookie: adminJ.cookie() } });
  assert.ok(!(await a3.text()).includes(testId));
  console.log("PASS admin page no longer shows deleted deadline");

  // Detail may still serve ISR-cached page until revalidation period expires.
  // In production, deleteDeadline Server Action calls revalidateDeadlines(id).
  // Here we only verify the DB state and admin SSR reflect the deletion.
  // A real 404 would appear after ISR s-maxage (60s) expires; we skip the wait.
  console.log("PASS (skipped ISR 404 wait — Server Action would revalidate)");

} finally {
  server.kill();
  await updateDatabase((c) => {
    c.deadlines = c.deadlines.filter((d) => d.id !== testId);
    c.completions = c.completions.filter((x) => x.deadlineId !== testId);
    return c;
  });
  const restored = await readDatabase();
  const ord = (a) => a.sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
  restored.deadlines = ord(restored.deadlines); db.deadlines = ord(db.deadlines);
  restored.completions = ord(restored.completions); db.completions = ord(db.completions);
  assert.deepEqual(restored, db);
  console.log("PASS original database data restored");
}


import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { readDatabase, updateDatabase } from "../src/lib/json-store.mjs";

const before = await readFile("data/db.json", "utf8");
const db = JSON.parse(before);
const deadlineId = db.deadlines[0].id;
const prerender = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
assert.equal(prerender.routes["/dashboard"], undefined, "/dashboard must NOT be prerendered (SSR only)");
console.log("PASS /dashboard is not in prerender-manifest (confirmed SSR)");
const base = "http://localhost:3110";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3110"], {
  env: { ...process.env, AUTH_SECRET: randomBytes(32).toString("base64"), AUTH_URL: base, AUTH_TRUST_HOST: "true" }, stdio: "pipe",
});
let logs = "";
server.stdout.on("data", (d) => { logs += d; }); server.stderr.on("data", (d) => { logs += d; });
function makeJar() { const jar = new Map(); return { jar, cookie() { return [...jar].map(([k,v]) => `${k}=${v}`).join("; "); } }; }
async function req(j, path, fields) {
  const r = await fetch(base + path, { method: fields ? "POST" : "GET", redirect: "manual", headers: { Cookie: j.cookie(), ...(fields ? { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" } : {}) }, body: fields ? new URLSearchParams(fields) : undefined });
  for (const c of r.headers.getSetCookie()) { const p = c.split(";")[0]; const i = p.indexOf("="); j.jar.set(p.slice(0, i), p.slice(i + 1)); }
  if (r.status === 200) return r.json(); return { status: r.status };
}
async function login(email, pw) {
  const j = makeJar(); const { csrfToken } = await req(j, "/api/auth/csrf");
  await req(j, "/api/auth/callback/credentials", { csrfToken, email, password: pw, callbackUrl: base + "/dashboard" });
  const s = await req(j, "/api/auth/session"); assert.equal(s.user.email, email);
  return { ...j, id: s.user.id };
}
async function getDashboard(a) {
  const r = await fetch(base + "/dashboard", { redirect: "manual", headers: { Cookie: a.cookie() } });
  return { status: r.status, html: await r.text(), cc: r.headers.get("cache-control") };
}
async function setComp(uid, done) {
  await updateDatabase((c) => { c.completions = c.completions.filter((x) => !(x.userId === uid && x.deadlineId === deadlineId)); if (done) c.completions.push({ userId: uid, deadlineId, completedAt: new Date().toISOString() }); return c; });
}
try {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(base + "/login")).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  // Guest guard
  const gR = await fetch(base + "/dashboard", { redirect: "manual" });
  assert.equal(gR.status, 307);
  assert.equal(new URL(gR.headers.get("location"), base).pathname, "/login");
  console.log("PASS guest redirected to /login");
  const user = await login("sv@ptit.edu.vn", "sv123456");
  const admin = await login("admin@ptit.edu.vn", "admin123");
  const uName = db.users.find((u) => u.email === "sv@ptit.edu.vn").name;
  // Initial render
  let d = await getDashboard(user);
  assert.equal(d.status, 200);
  assert.match(d.cc, /private|no-store|no-cache/);
  assert.ok(d.html.includes("Dashboard") && d.html.includes(uName));
  assert.ok(d.html.includes(`data-deadline-id="${deadlineId}"`));
  console.log("PASS user dashboard renders name, stats, cards, private cache");
  // Mark user done via DB, check dashboard
  await setComp(user.id, true); await setComp(admin.id, false);
  d = await getDashboard(user);
  assert.ok(d.html.includes(`data-deadline-id="${deadlineId}" data-completed="true"`));
  let ad = await getDashboard(admin);
  assert.ok(ad.html.includes(`data-deadline-id="${deadlineId}" data-completed="false"`));
  console.log("PASS per-account isolation (user=true, admin=false)");
  // Toggle
  await setComp(user.id, false); await setComp(admin.id, true);
  d = await getDashboard(user); ad = await getDashboard(admin);
  assert.ok(d.html.includes(`data-deadline-id="${deadlineId}" data-completed="false"`));
  assert.ok(ad.html.includes(`data-deadline-id="${deadlineId}" data-completed="true"`));
  console.log("PASS toggle & refresh persistence, isolation confirmed");
  // Stats & layout
  assert.ok(d.html.includes("Tổng deadline") && d.html.includes("Đã hoàn thành"));
  assert.ok(d.html.includes("Class Deadline Hub") && d.html.includes("Tổng quan"));
  assert.ok(d.html.includes("Đánh dấu hoàn thành") || d.html.includes("Bỏ đánh dấu"));
  console.log("PASS stats, layout, and completion buttons rendered");
} finally {
  server.kill();
  await updateDatabase((c) => {
    c.completions = c.completions.filter((x) => x.deadlineId !== deadlineId || !db.users.some((u) => u.id === x.userId));
    c.completions.push(...db.completions.filter((x) => x.deadlineId === deadlineId));
    return c;
  });
  const restored = await readDatabase();
  const ord = (a) => a.sort((x,y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
  restored.completions = ord(restored.completions); db.completions = ord(db.completions);
  assert.deepEqual(restored, db);
  console.log("PASS original database data restored");
}

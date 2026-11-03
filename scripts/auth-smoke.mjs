import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { decode } from "next-auth/jwt";

const base = "http://localhost:3109";
const secret = randomBytes(32).toString("base64");
const before = await readFile("data/db.json", "utf8");
const db = JSON.parse(before);
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3109"], {
  env: { ...process.env, AUTH_SECRET: secret, AUTH_URL: base, AUTH_TRUST_HOST: "true" }, stdio: "pipe",
});
let logs = "";
server.stdout.on("data", (d) => { logs += d; });
server.stderr.on("data", (d) => { logs += d; });
const jar = new Map();
async function request(path, fields) {
  const response = await fetch(base + path, {
    method: fields ? "POST" : "GET", redirect: "manual",
    headers: { Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "), ...(fields ? { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" } : {}) },
    body: fields ? new URLSearchParams(fields) : undefined,
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0]; const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
  assert.equal(response.status, 200, `${path}: ${await response.clone().text()}`);
  return response.json();
}
try {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(base + "/login")).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  for (const route of ["/dashboard", "/admin", "/admin/nested?tab=one", "/dashboard?next=https://evil.example"]) {
    const response = await fetch(base + route, { redirect: "manual", headers: { "x-user-id": "user-admin", "x-role": "admin", Cookie: "authjs.session-token=forged" } });
    assert.equal(response.status, 307);
    const location = new URL(response.headers.get("location"), base);
    assert.equal(location.pathname, "/login");
    assert.equal(location.origin, base);
    const returned = new URL(location.searchParams.get("next"), base);
    const expected = new URL(route, base);
    assert.equal(returned.origin, base);
    assert.equal(returned.pathname, expected.pathname);
    assert.deepEqual([...returned.searchParams], [...expected.searchParams]);
  }
  assert.equal((await fetch(base + "/deadlines")).status, 200);
  console.log("PASS guest guards / safe return path / forged cookie rejected / public deadlines");
  for (const [email, password, role] of [["admin@ptit.edu.vn", "admin123", "admin"], ["sv@ptit.edu.vn", "sv123456", "user"]]) {
    jar.clear();
    const { csrfToken } = await request("/api/auth/csrf");
    const login = await request("/api/auth/callback/credentials", { csrfToken, email, password, callbackUrl: base + "/dashboard" });
    assert.equal(login.url, base + "/dashboard");
    const session = await request("/api/auth/session");
    const user = db.users.find((u) => u.email === email);
    assert.deepEqual(session.user, { id: user.id, name: user.name, email, role });
    assert.ok(!JSON.stringify(session).includes("passwordHash"));
    const token = await decode({ token: jar.get("authjs.session-token"), secret, salt: "authjs.session-token" });
    assert.equal(token.id, user.id); assert.equal(token.role, role);
    for (const route of ["/dashboard", "/admin"]) {
      const response = await fetch(base + route, { redirect: "manual", headers: { Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") } });
      if (route === "/admin" && role === "user") {
        assert.equal(response.status, 307);
        assert.equal(new URL(response.headers.get("location"), base).pathname, "/403");
      } else {
        assert.equal(response.status, 200);
        assert.ok((await response.text()).includes(user.name));
      }
    }
    console.log("PASS protected routes", role);
    const csrf = await request("/api/auth/csrf");
    await request("/api/auth/signout", { csrfToken: csrf.csrfToken, callbackUrl: base });
    assert.equal(await request("/api/auth/session"), null);
    const afterLogout = await fetch(base + "/dashboard", { redirect: "manual", headers: { Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") } });
    assert.equal(afterLogout.status, 307);
    assert.equal(new URL(afterLogout.headers.get("location"), base).pathname, "/login");
    console.log("PASS login / JWT / session / logout", role);
  }
  jar.clear();
  let csrf = await request("/api/auth/csrf");
  const bad = await request("/api/auth/callback/credentials", { csrfToken: csrf.csrfToken, email: "admin@ptit.edu.vn", password: "wrong", callbackUrl: base });
  assert.ok(bad.url.includes("CredentialsSignin"));
  assert.equal(await request("/api/auth/session"), null);
  console.log("PASS incorrect password rejected");
  jar.clear(); csrf = await request("/api/auth/csrf");
  const external = await request("/api/auth/callback/credentials", { csrfToken: csrf.csrfToken, email: "sv@ptit.edu.vn", password: "sv123456", callbackUrl: "https://evil.example/" });
  assert.equal(new URL(external.url).origin, base);
  assert.equal(await readFile("data/db.json", "utf8"), before);
  console.log("PASS external redirect blocked; JSON unchanged");
} finally { server.kill(); }

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { readDatabase, updateDatabase } from "../src/lib/json-store.mjs";
const mutationTest = process.argv.includes("--verify-regeneration");
const testId = `isr-test-${Date.now()}`;
const original = await readFile("data/db.json", "utf8");
const db = await readDatabase();
const manifest = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
for (const route of ["/deadlines", ...db.deadlines.map((d) => `/deadlines/${d.id}`)]) {
  assert.equal(manifest.routes[route].initialRevalidateSeconds, 60);
}
assert.notEqual(manifest.dynamicRoutes["/deadlines/[id]"].fallback, false);
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3108"], { stdio: "pipe" });
let logs = "";
server.stdout.on("data", (d) => { logs += d; });
server.stderr.on("data", (d) => { logs += d; });
try {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch("http://localhost:3108/login")).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  for (const route of ["/deadlines", "/deadlines/dl-001", "/deadlines/1"]) {
    const response = await fetch(`http://localhost:3108${route}`);
    console.log("HTTP", route, response.status, response.url);
    if (response.status !== 200) console.log(logs);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control"), /s-maxage=60/);
    const html = await response.text();
    assert.ok(html.includes("Thực hành 4"));
    assert.ok(!html.includes("passwordHash"));
    if (route === "/deadlines") for (const d of db.deadlines) assert.ok(html.includes(d.title));
    console.log("PASS", route, response.headers.get("cache-control"), response.headers.get("x-nextjs-cache"));
  }
  assert.equal((await fetch("http://localhost:3108/deadlines/999999")).status, 404);
  console.log("PASS unknown ID 404; manifest ISR 60s and runtime fallback enabled");
  if (mutationTest) {
    await updateDatabase((data) => {
      data.deadlines.push({ ...data.deadlines[0], id: testId, title: testId });
      return data;
    });
    const added = await fetch(`http://localhost:3108/deadlines/${testId}`);
    assert.equal(added.status, 200);
    assert.ok((await added.text()).includes(testId));
    console.log("PASS new ID after build", added.headers.get("x-nextjs-cache"));
    console.log("Waiting 65 seconds to verify time-based regeneration...");
    await new Promise((r) => setTimeout(r, 65000));
    let found = false;
    for (let i = 0; i < 15; i++) {
      const response = await fetch("http://localhost:3108/deadlines");
      if ((await response.text()).includes(testId)) { found = true; break; }
      await new Promise((r) => setTimeout(r, 1000));
    }
    assert.ok(found, "ISR list must include the post-build record after regeneration");
    console.log("PASS list regenerated after 60 seconds without rebuilding");
  }
} finally {
  server.kill();
  if (mutationTest) {
    await updateDatabase((data) => { data.deadlines = data.deadlines.filter((d) => d.id !== testId); return data; });
    assert.equal(await readFile("data/db.json", "utf8"), original);
    console.log("PASS database restored byte-for-byte");
  }
}


import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const base = "http://localhost:3112";
const db = JSON.parse(await readFile("data/db.json", "utf8"));
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3112"], { env: { ...process.env, AUTH_SECRET: randomBytes(32).toString("hex"), AUTH_URL: base, AUTH_TRUST_HOST: "true" }, stdio: "pipe" });
let logs = "";
server.stderr.on("data", (chunk) => { logs += chunk; });
server.stdout.on("data", (chunk) => { logs += chunk; });
const html = async (path) => {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  return response.text();
};
const meta = (source, name) => source.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1];
try {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(base + "/login")).ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const sitemap = await html("/sitemap.xml");
  for (const deadline of db.deadlines) assert.ok(sitemap.includes(`/deadlines/${deadline.id}</loc>`));
  for (const subject of db.subjects) assert.ok(sitemap.includes(`/subjects/${subject.slug}</loc>`));
  for (const path of ["/admin", "/dashboard", "/login", "/403"]) assert.ok(!sitemap.includes(`${path}</loc>`));
  const robots = await html("/robots.txt");
  for (const path of ["/admin", "/dashboard", "/login", "/403", "/api/"]) assert.ok(robots.includes(`Disallow: ${path}`));
  assert.ok(robots.includes("/sitemap.xml"));
  console.log("PASS sitemap and robots");
  assert.match(meta(await html("/login"), "robots"), /noindex/);
  assert.match(meta(await html("/403"), "robots"), /noindex/);
  const images = [];
  for (const id of ["1", db.deadlines[1].id]) {
    const source = await html(`/deadlines/${id}`);
    const deadline = db.deadlines.find((item) => item.id === (id === "1" ? "dl-001" : id));
    assert.ok(source.includes(`<title>${deadline.title} | Class Deadline Hub</title>`));
    assert.ok(source.includes(`href="http://localhost:3000/deadlines/${deadline.id}"`));
    assert.ok(meta(source, "description"));
    assert.equal(meta(source, "twitter:card"), "summary_large_image");
    const data = JSON.parse(source.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(data["@type"], "BreadcrumbList");
    assert.equal(data.itemListElement[2].name, deadline.title);
    assert.ok(data.itemListElement[2].item.endsWith(`/deadlines/${deadline.id}`));
    const imageUrl = new URL(meta(source, "og:image").replaceAll("&amp;", "&"));
    const response = await fetch(base + imageUrl.pathname + imageUrl.search);
    assert.equal(response.status, 200, await response.clone().text().then((s) => s.slice(0, 200)));
    assert.match(response.headers.get("content-type"), /image\/png/);
    const image = Buffer.from(await response.arrayBuffer());
    assert.equal(image.readUInt32BE(16), 1200);
    assert.equal(image.readUInt32BE(20), 630);
    images.push(image);
  }
  assert.notDeepEqual(images[0], images[1]);
  console.log("PASS view-source /deadlines/1, dynamic metadata, JSON-LD and distinct 1200x630 PNG images");
  const manifest = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
  assert.ok(manifest.routes["/"]);
  assert.equal(manifest.routes["/deadlines"].initialRevalidateSeconds, 60);
  assert.equal(manifest.routes["/dashboard"], undefined);
  console.log("PASS SSG/ISR preserved; login and 403 noindex");
} finally {
  server.kill();
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";
const source = await readFile("src/lib/login-validation.ts", "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const exports = {};
new Function("require", "exports", outputText)(createRequire(import.meta.url), exports);
const { safeReturnPath, loginSchema } = exports;

test("Return URLs stay local and cannot redirect into the auth API", () => {
  for (const input of [null, "", "https://evil.example", "//evil.example", "/\\evil.example", "/%2fevil.example", "/%5cevil.example", "/%0a/evil.example", "/api/auth/signout", "/login", "/%", "javascript:alert(1)"]) {
    assert.equal(safeReturnPath(input), "/", String(input));
  }
  assert.equal(safeReturnPath("/dashboard?tab=deadlines#top"), "/dashboard?tab=deadlines#top");
  assert.equal(safeReturnPath("/deadlines/1"), "/deadlines/1");
});
test("Credentials are validated and email normalized without changing password", () => {
  assert.deepEqual(loginSchema.parse({ email: " ADMIN@ptit.edu.vn ", password: "admin123" }), { email: "admin@ptit.edu.vn", password: "admin123" });
  for (const input of [{ email: "bad", password: "a" }, { email: "sv@ptit.edu.vn", password: "" }, { email: "sv@ptit.edu.vn", password: "x".repeat(73) }]) assert.equal(loginSchema.safeParse(input).success, false);
});

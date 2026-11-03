import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile("src/lib/permissions.ts", "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { can, permissions } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("Every role/action pair follows the central permission matrix", () => {
  const expected = {
    guest: ["subject:read", "deadline:read"],
    user: ["subject:read", "deadline:read", "completion:update", "dashboard:access"],
    admin: Object.keys(permissions),
  };
  for (const [role, allowed] of Object.entries(expected)) {
    for (const action of Object.keys(permissions)) assert.equal(can(role, action), allowed.includes(action), `${role}: ${action}`);
  }
  assert.equal(can("forged-role", "admin:access"), false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile("src/lib/deadline-time.ts", "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { deadlineTiming } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("Countdown respects Vietnam midnight, exact expiry and calendar days", () => {
  const due = "2026-11-08T23:59:00+07:00";
  assert.deepEqual(deadlineTiming(due, Date.parse("2026-11-08T10:00:00+07:00")), { status: "soon", countdown: "Hết hạn hôm nay" });
  assert.deepEqual(deadlineTiming(due, Date.parse(due)), { status: "overdue", countdown: "Hết hạn hôm nay" });
  assert.deepEqual(deadlineTiming(due, Date.parse("2026-11-08T17:00:00Z")), { status: "overdue", countdown: "Quá hạn 1 ngày" });
  assert.deepEqual(deadlineTiming(due, Date.parse("2026-11-05T23:59:00+07:00")), { status: "open", countdown: "Còn 3 ngày" });
  assert.equal(deadlineTiming(due, Date.parse("2026-11-06T00:00:00+07:00")).status, "soon");
});

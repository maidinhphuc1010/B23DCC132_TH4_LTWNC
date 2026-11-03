import { describe, expect, test } from "@jest/globals";
import { mergeGitHubUser } from "@/lib/github-user";
import { databaseSchema } from "@/lib/db-schema.mjs";
import { can } from "@/lib/permissions";
import type { Database } from "@/types";

const fixture = (): Database => ({ subjects: [], deadlines: [], completions: [], users: [
  { id: "admin-demo", name: "Admin", email: "admin@example.com", passwordHash: "$2b$10$" + "a".repeat(53), role: "admin", createdAt: "2026-01-01T00:00:00Z" },
  { id: "student-demo", name: "Student", email: "student@example.com", passwordHash: "$2b$10$" + "b".repeat(53), role: "user", createdAt: "2026-01-01T00:00:00Z" },
] });

describe("GitHub identity isolation", () => {
  test("same email as admin never links or overwrites demo accounts", () => {
    const db = fixture();
    const original = structuredClone(db.users);
    const user = mergeGitHubUser(db, { accountId: "123", name: "GitHub", email: "admin@example.com" });
    expect(user.id).toBe("github:123");
    expect(user.role).toBe("user");
    expect(user.passwordHash).toBeNull();
    expect(db.users.slice(0, 2)).toEqual(original);
    expect(databaseSchema.safeParse(db).success).toBe(true);
    expect(can(user.role, "dashboard:access")).toBe(true);
    expect(can(user.role, "completion:update")).toBe(true);
    expect(can(user.role, "admin:access")).toBe(false);
  });
  test("stable account ID survives name/email changes and accepts private email", () => {
    const db = fixture();
    const first = mergeGitHubUser(db, { accountId: "123", name: "First", email: "first@example.com" });
    const again = mergeGitHubUser(db, { accountId: "123", name: "Renamed", email: null });
    expect(again.id).toBe(first.id);
    expect(again.createdAt).toBe(first.createdAt);
    expect(again.email).toBeNull();
    expect(db.users).toHaveLength(3);
    expect(databaseSchema.safeParse(db).success).toBe(true);
  });
  test("does not accept injected role and schema rejects elevated GitHub accounts", () => {
    const db = fixture();
    const input = { accountId: "456", name: "GitHub", email: null, role: "admin" };
    const user = mergeGitHubUser(db, input);
    expect(user.role).toBe("user");
    expect(databaseSchema.safeParse({ ...db, users: [{ ...user, role: "admin" }] }).success).toBe(false);
  });
  test("rejects malformed provider account IDs", () => {
    expect(() => mergeGitHubUser(fixture(), { accountId: "admin-demo", name: "GitHub", email: null })).toThrow();
  });
  test("refuses collision with a Credentials identity", () => {
    const db = fixture();
    db.users[0].id = "github:123";
    const before = structuredClone(db);
    expect(() => mergeGitHubUser(db, { accountId: "123", name: "GitHub", email: null })).toThrow();
    expect(db).toEqual(before);
  });
});

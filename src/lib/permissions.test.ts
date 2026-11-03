import { describe, expect, test } from "@jest/globals";
import { can, type Action } from "@/lib/permissions";
import type { Role } from "@/types";

type PermissionCase = {
  role: Role;
  action: Action;
  allowed: boolean;
};

// Explicit expected outcomes: do not derive expectations from the permissions map.
const cases: PermissionCase[] = [
  { role: "guest", action: "deadline:read", allowed: true },
  { role: "guest", action: "completion:update", allowed: false },
  { role: "guest", action: "deadline:create", allowed: false },
  { role: "guest", action: "deadline:delete", allowed: false },
  { role: "user", action: "deadline:read", allowed: true },
  { role: "user", action: "completion:update", allowed: true },
  { role: "user", action: "deadline:create", allowed: false },
  { role: "user", action: "deadline:delete", allowed: false },
  { role: "admin", action: "deadline:read", allowed: true },
  { role: "admin", action: "completion:update", allowed: true },
  { role: "admin", action: "deadline:create", allowed: true },
  { role: "admin", action: "deadline:delete", allowed: true },
];

describe("can(role, action)", () => {
  test.each(cases)("$role / $action => $allowed", ({ role, action, allowed }) => {
    expect(can(role, action)).toBe(allowed);
  });
});

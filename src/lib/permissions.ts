import type { Role } from "@/types";

export const permissions = {
  "subject:read": ["guest", "user", "admin"],
  "deadline:read": ["guest", "user", "admin"],
  "completion:update": ["user", "admin"],
  "deadline:create": ["admin"],
  "deadline:update": ["admin"],
  "deadline:delete": ["admin"],
  "dashboard:access": ["user", "admin"],
  "admin:access": ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Action = keyof typeof permissions;
export function can(role: Role, action: Action): boolean {
  const allowed: readonly Role[] = permissions[action];
  return allowed.includes(role);
}

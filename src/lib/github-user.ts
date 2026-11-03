import { z } from "zod";
import type { Database, User } from "@/types";

const githubIdentity = z.object({
  accountId: z.string().regex(/^[1-9]\d*$/),
  name: z.string().trim().min(1).max(200),
  email: z.email().nullable(),
});

// Only call with the account ID returned by Auth.js after OAuth verification.
// Never match accounts by email, and never accept a role from the provider/client.
export function mergeGitHubUser(db: Database, input: z.input<typeof githubIdentity>): User {
  const identity = githubIdentity.parse(input);
  const id = `github:${identity.accountId}`;
  const existing = db.users.find((user) => user.id === id);
  if (existing && (!("provider" in existing) || existing.provider !== "github")) {
    throw new Error("GitHub identity conflicts with an existing account.");
  }
  const user: User = {
    id, provider: "github", name: identity.name, email: identity.email,
    passwordHash: null, role: "user", createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  if (existing) db.users[db.users.indexOf(existing)] = user;
  else db.users.push(user);
  return user;
}

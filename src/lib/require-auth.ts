import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/repository";
import { can, type Action } from "@/lib/permissions";
import { safeReturnPath } from "@/lib/login-validation";

// Every future mutation must call this inside the action itself, before reading/writing
// private data. Derive completion.userId from the returned user, NEVER form input.
export async function requirePermission(action: Action, returnTo = "/dashboard") {
  const session = await auth();
  const user = session?.user.id ? await getUserById(session.user.id) : undefined;
  if (!user) redirect(`/login?next=${encodeURIComponent(safeReturnPath(returnTo))}`);
  if (!can(user.role, action)) redirect("/403");
  // Do not return the password hash to callers that may pass data to Client Components.
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function requireUser(returnTo = "/dashboard") {
  return requirePermission("dashboard:access", returnTo);
}
export function requireAdmin(returnTo = "/admin") {
  return requirePermission("admin:access", returnTo);
}

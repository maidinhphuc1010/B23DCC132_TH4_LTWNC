import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";
import { safeReturnPath } from "@/lib/login-validation";

// Next.js 16 Proxy uses Node.js by default; do not add a runtime export.
// This is an early navigation guard, not a substitute for checks inside pages/actions.
export const proxy = auth((request) => {
  // Actions enforce their own session and current database permissions.
  // Keep navigation redirects out of the action protocol so errors reach the form.
  if (request.method === "POST" && request.headers.has("next-action")) return NextResponse.next();
  if (!request.auth?.user?.id) {
    const login = new URL("/login", request.nextUrl.origin);
    login.searchParams.set("next", safeReturnPath(request.nextUrl.pathname + request.nextUrl.search));
    return NextResponse.redirect(login);
  }
  const action = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")
    ? "admin:access" : "dashboard:access";
  if (!can(request.auth.user.role, action)) return NextResponse.redirect(new URL("/403", request.nextUrl.origin));
  return NextResponse.next();
});

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };

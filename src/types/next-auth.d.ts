import type { DefaultSession } from "next-auth";
import "next-auth/jwt";
import type { Role } from "@/types";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  interface Session {
    user: DefaultSession["user"] & { id: string; role: Role; name: string; email: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

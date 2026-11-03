import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import { getUserByEmail, saveGitHubUser } from "@/lib/repository";
import { loginSchema, safeReturnPath } from "@/lib/login-validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const user = await getUserByEmail(parsed.data.email);
      if (!user?.passwordHash || !await bcrypt.compare(parsed.data.password, user.passwordHash)) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  }), GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
  })],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "github" && user) {
        const stored = await saveGitHubUser({
          accountId: account.providerAccountId,
          name: user.name?.trim() || "GitHub user",
          email: user.email ?? null,
        });
        token.id = stored.id;
        token.sub = stored.id;
        token.role = "user";
        token.name = stored.name;
        token.email = stored.email;
      } else if (account?.provider === "credentials" && user) {
        token.id = user.id; token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name ?? "";
      session.user.email = token.email ?? "";
      return session;
    },
    redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        if (target.origin !== new URL(baseUrl).origin) return `${baseUrl}/`;
        return new URL(safeReturnPath(`${target.pathname}${target.search}${target.hash}`), baseUrl).href;
      } catch { return `${baseUrl}/`; }
    },
  },
});

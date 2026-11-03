# Authentication

Uses installed next-auth 5.0.0-beta.32: NextAuth() exports handlers/auth/signIn/signOut, Credentials provider, JWT session strategy, and client redirectTo options (not deprecated callbackUrl options). The login URL still accepts callbackUrl or next query parameters.

## Environment (required before running login)

Create .env.local at the project root. It is already ignored by .gitignore. Set AUTH_SECRET to a cryptographically random value (at least 32 bytes). Generate one locally with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Set AUTH_URL=http://localhost:3000 for local use; use your canonical HTTPS origin in production. AUTH_SECRET must remain stable across restarts and must be the same on all instances. Do not commit it. Behind a trusted reverse proxy, AUTH_TRUST_HOST=true is appropriate only if the proxy sanitizes Host/forwarded headers. Never accept arbitrary forwarded hosts from the public internet. Missing AUTH_SECRET causes Auth.js to refuse production authentication; there is no fallback secret.

Demo accounts already in the JSON data:
- admin@ptit.edu.vn / admin123 (admin)
- sv@ptit.edu.vn / sv123456 (user)

No reset seed is needed. Change demo credentials before real deployment.

## Architecture

src/auth.ts reads users only on the server and compares passwordHash with bcryptjs. Only id, name, email and role leave authorize(). Roles use the existing guest | user | admin union, with module augmentation for User, Session and JWT. JWT fields originate from the database, not client input. The client cannot assign its own role through session updates.

The public server layout never calls auth(). A small SessionProvider/useSession client island in the header reads the session after hydration. Login uses a Suspense-wrapped client form so search parameters do not turn the page into SSR. User/session data is never put into public SSG/ISR caches.

Both client return paths and the server redirect callback restrict navigation to local routes. The form uses redirect:false and navigates only to the validated local path. Auth.js supplies CSRF handling and session cookies. Authorization now uses the single matrix in src/lib/permissions.ts. src/proxy.ts matches only /admin/:path* and /dashboard/:path*, validates the Auth.js session and redirects guests to /login?next=... or insufficient roles to /403. Next.js 16.4.4 Proxy runs on Node.js, so it can share the existing Auth.js configuration without an Edge-safe split. Both pages independently call requireAdmin()/requireUser() from src/lib/require-auth.ts. The helpers re-read the current database account by the authenticated session ID and check the current role, rejecting deleted accounts or revoked permissions even if the JWT is stale. A newly promoted user may need to sign in again because the early Proxy guard still sees the previous JWT role. No role/userId from headers, forms or query parameters is trusted. /403 is an informational static page after a redirect, not an HTTP 403 response. CRUD remains a separate next task. Add a deployment-appropriate login rate limiter before public production use. JWT roles reflect sign-in time; future permission changes require an explicit revocation/refresh policy.

## Tests

After npm run build, run node scripts/auth-smoke.mjs. The script starts production on port 3109 with a fresh environment-only secret. It verifies both logins, decrypted JWT claims, session fields, wrong password, logout, external redirect rejection and unchanged JSON. No secret or JWT is logged.

Run node --test scripts/login-validation.test.mjs for local redirect and input validation tests. Existing scripts/smoke.mjs and scripts/isr-smoke.mjs verify public SSG/ISR. Browser-based form interaction/visual checks remain manual.

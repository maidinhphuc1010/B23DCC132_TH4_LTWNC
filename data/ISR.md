# Public deadline ISR

Next.js 16.4.4 uses the standard cache model here: Cache Components and partialPrefetching remain disabled. Home and subject pages retain build-time SSG. Both deadline pages export `revalidate = 60`; the detail route also exports `dynamicParams = true`, `dynamic = "force-static"` and generates existing IDs at build time. New IDs can be generated and cached on first visit. No request-time API, no-store or force-dynamic is used.

Repository reads the JSON file each time Next regenerates HTML. There is no additional repository cache to become stale. After 60 seconds, the next request can serve stale HTML while background regeneration runs; a later request gets the new version. This is not a timer that automatically refreshes every open browser. The client countdown updates locally, but new/edited records need navigation or reload to receive refreshed server data.

Call `revalidateDeadlines(id)` from an authenticated, authorized admin Server Action/Route Handler after successfully writing JSON, including after deleting an ID. It invalidates the list and the affected detail (including cached 404). It does not expose an unauthenticated revalidation endpoint. This helper is prepared, not yet connected to admin CRUD. Home and subject SSG snapshots remain unchanged until rebuild.

Existing seed IDs remain dl-001 through dl-012. `/deadlines/1` is a compatibility alias for `/deadlines/dl-001`, not a new database record.

Countdown compares calendar days in Vietnam (UTC+7, no daylight saving). Status compares exact instants: overdue starts at dueAt, soon means a future deadline today or within the next two calendar days. On the due date, countdown says “Hết hạn hôm nay”; after the exact cutoff, the badge additionally says “Quá hạn”. Initial client state uses the server-provided timestamp to match prerendered HTML; the clock starts updating after hydration. Public data is never fetched through useEffect.

Validation:
- `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`
- `node --test scripts/deadline-time.test.mjs`
- `node scripts/smoke.mjs` checks existing routes and SSG.
- `node scripts/isr-smoke.mjs` checks ISR manifest, production cache headers, /deadlines/1 alias and 404.
- `node scripts/isr-smoke.mjs --verify-regeneration` temporarily inserts a uniquely named record, verifies a post-build ID and regeneration after 65 seconds, then removes only that record and checks byte equality. Run only in local development with no concurrent writes. Rebuild afterwards to clear test HTML cached by Next.

Requires a Node server with writable persistent storage, not an ephemeral/serverless filesystem. No browser automation library is installed; filter interaction and hydration have not been browser-automated.

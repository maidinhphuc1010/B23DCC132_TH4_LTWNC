# SEO — Class Deadline Hub

- Set `SITE_URL` to the deployed HTTP(S) origin **before building**. Default: `http://localhost:3000`. Rebuild after changing it. Canonical URLs, sitemap, robots and social metadata use this trusted configuration, never request headers.
- `/deadlines/1` is a compatibility URL; its canonical and breadcrumb point to `/deadlines/dl-001`.
- Home and subject pages remain SSG. Deadline pages and sitemap use 60-second ISR. Successful admin mutations invalidate sitemap, detail pages and nested image routes.
- Next.js generates versioned OG image URLs. Read the `og:image` tag instead of hardcoding the filename. Twitter uses the OG image fallback with `summary_large_image`.
- Local Noto Sans supports Vietnamese: `public/fonts/NotoSans-Regular.ttf`. Source: https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf/NotoSans . SIL Open Font License is included in `public/fonts/OFL.txt`. Both next/font/local and ImageResponse use this asset; deploy public assets with the app.
- Robots directives do not replace authorization. Private pages also declare noindex; session and permission checks remain enabled.

## Verification

After `npm run build`, run:

```sh
node scripts/seo-smoke.mjs
node scripts/admin-smoke.mjs
npm run lint
npm test
```

SEO smoke expects the default localhost canonical origin. Admin smoke uses seeded demo accounts, exercises real Server Actions, and removes its test records. Do not run mutation smoke against a live production database.

The checks cover source HTML, canonical, social metadata, valid breadcrumb JSON, distinct 1200×630 PNG images, sitemap, robots, authenticated private-page noindex and preserved SSG/ISR. Visual layout and external social-platform caches may still need manual verification after deployment.

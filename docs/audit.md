# ReloFinder Technical SEO Audit (Astro + SSG)

## Executive Summary (Top Blockers)
- P0 — Invalid hreflang alternates: `SEOHead.astro` outputs `hreflang` for `de`, `fr`, `it` without localized routes, creating alternates to non-existent URLs. Remove until locales exist. File: `src/components/common/SEOHead.astro`.
- P0 — Sitemap includes 404s: `astro.config.mjs` adds `customPages` that don’t exist (`/services/corporate`, `/services/expat`). Remove to avoid Google errors. File: `astro.config.mjs`.
- P0 — Company JSON-LD bug: `SchemaMarkup.astro` builds `LocalBusiness` with `address` expecting a string, but consumers pass an object or full JSON-LD. Results in malformed schema (`[object Object]`). Fix component to pass through full JSON-LD or properly map nested objects. File: `src/components/common/SchemaMarkup.astro`.
- P1 — Potential route duplication: Static service pages (e.g., `src/pages/services/visa.astro`) coexist with dynamic `src/pages/services/[id].astro`. Ensure no duplicate URLs/conflicting content; prefer one canonical route pattern.
- P1 — CLS from hero images: Large images lack explicit dimensions in region/service templates. Add width/height and priority hints to stabilize layout.

## Static vs SSR
- Output: SSG. Config sets `output: 'static'` with Tailwind, React, MDX, Sitemap, and `astro-compress`. File: `astro.config.mjs`.
- Dynamic routes use `getStaticPaths()` and render at build:
  - `src/pages/blog/[slug].astro`
  - `src/pages/regions/[id].astro`
  - `src/pages/services/[id].astro`
  - `src/pages/companies/[id].astro`
- API routes under `src/pages/api/**` (e.g. `ai-analysis/[companyId].ts`) are not available in pure static hosting. The UI calls these for client-only features (e.g., AI analysis), not critical for indexability. If needed, port to Netlify Functions and update client paths.
- Recommendation: Keep 100% SSG for all indexable pages. Shift any dynamic compute to prebuild (content collections) or edge/functions with separate paths (non-critical to index).

## Content Collections (src/content/config.ts)
- Collections: `companies`, `services`, `regions`, `blog`, `reviews` (data). Schemas are permissive but lack hard requirements for SEO fields (e.g., `seoTitle`, `seoDescription`).
- Slug routing: Dynamic templates use `data.id || entry.slug`. Ensure each markdown provides a stable `id` or rely on filename slugs consistently.
- Gaps:
  - No computed canonical/excerpt fields.
  - Optional `seoTitle`/`seoDescription` not enforced; risk of duplicates.
- Recommendation: Tighten schemas with required SEO fields and computed canonicals; ensure `id` present and kebab-cased across collections that are routed.

## Indexability Controls
- Robots: `public/robots.txt` allows all, disallows admin/private/src, and references `https://relofinder.ch/sitemap-index.xml` — OK.
- Meta robots: `SEOHead.astro` sets `index, follow` — OK.
- Canonicals: Built as absolute when `canonical` prop provided; otherwise uses `Astro.url.href` — OK.
- Hreflang: Currently outputs en/de/fr/it despite only English site — remove until locales exist (P0).
- Server-rendered HTML: All key content is present in HTML (Astro SSG), not JS-only — OK.

## Sitemap & Discoverability
- Integration: `@astrojs/sitemap` present. Filter excludes `/admin`, `/private`, `/api` — good.
- Issue: `customPages` contains non-existent URLs causing 404s in sitemap (P0). Remove and rely on auto-discovered routes from build.
- Internal linking:
  - Home → Regions/Services/Companies implemented.
  - Service and region pages include some related links but often < 18–25 contextual links target. Add more contextual cross-links per the internal linking strategy.

## Metadata & Structured Data
- Titles/descriptions: Good scaffolding via `SEOHead.astro`. Ensure page-unique meta across services/regions to avoid duplicates.
- OG/Twitter: Present with absolute images.
- JSON-LD:
  - Home: Organization/WebSite included (OK via schema prop).
  - Blog: `Article` + `BreadcrumbList` (OK).
  - Regions/Services: Missing more specific schema (Service/Place) in some templates; can be enhanced.
  - Companies: `LocalBusiness` generated but currently malformed due to `SchemaMarkup.astro` mapping (P0 fix below).

## Performance & CWV (Template-level)
- Likely LCP: Hero image in home/region/service/blog. Use width/height and preload for primary hero; lazy-load non-critical images.
- CLS sources: Missing explicit dimensions on heroes; sticky UI elements.
- Assets: Cloudinary used in many places; adopt consistently; use `<img>` width/height where `CloudinaryImage` isn’t used.

## Pagination/Facets/Params
- No infinite-scroll-only paths; principal lists are link-based. Ensure any future filters use canonicalization to primary pages.

## Multilingual / Hreflang
- No localized routes — remove alternates. Add later with real locales and reciprocal linking.

## Live vs Build Parity
- Hosting: Netlify static (`publish = dist`), Node 18. API-like endpoints under `src/pages/api` won’t exist in production under static build; port to Netlify Functions if needed.

## Analytics & Search Console
- Ensure GA4 is enabled only once (not audited here). Verify GSC property, sitemap submission, Coverage → no 404s from sitemap, Page Indexing → no "Alternate page with proper canonical" inflation.

---

## Route & Data Map
- Home: `/` → `src/pages/index.astro` (SSG) → uses `SEOHead`, schema Organization.
- Regions: `/regions/[id]` → `src/pages/regions/[id].astro` (SSG) from `regions` collection.
- Services: `/services/[id]` → `src/pages/services/[id].astro` (SSG) from `services` collection; also separate static service pages exist — ensure no duplicates.
- Companies: `/companies/[id]` → `src/pages/companies/[id].astro` (SSG) from `companies` collection.
- Blog: `/blog/[slug]` → `src/pages/blog/[slug].astro` (SSG) from `blog` collection.

---

## Indexability Matrix (sample)
URL | template | in_sitemap | canonical | indexable | internal_links (est.) | notes
- `/` | `pages/index.astro` | Yes | self | Yes | 20+ | Good, add WebSite schema if desired
- `/regions/zurich` | `pages/regions/[id].astro` | Yes | self | Yes | 15 | Add width/height on hero
- `/services/housing` | `pages/services/[id].astro` or static | Yes | self | Yes | 12 | Ensure single canonical route
- `/companies/prime-relocation` | `pages/companies/[id].astro` | Yes | self | Yes | 10 | Fix LocalBusiness JSON-LD mapping
- `/blog/opening-swiss-bank-account-guide` | `pages/blog/[slug].astro` | Yes | self | Yes | 15 | OK

---

## PR-Ready Changes
- P0: Remove invalid hreflang alternates in `src/components/common/SEOHead.astro`.
- P0: Remove 404 `customPages` from `astro.config.mjs` sitemap config; add `trailingSlash: 'never'` to normalize URLs.
- P0: Fix `src/components/common/SchemaMarkup.astro` to:
  - Pass-through full JSON-LD objects when provided (contains `@context` and `@type`).
  - Support nested `address` objects for LocalBusiness.
- P1: Reduce CLS by adding `width` and `height` to hero images in:
  - `src/pages/regions/[id].astro`
  - `src/pages/services/[id].astro`
- P1: Consolidate service routing to avoid duplicates (choose dynamic `[id].astro` + content collections; deprecate overlapping static `.astro` service pages or set canonical to primary).

---

## Verification Checklist (post-merge)
- View page source of `/`, `/regions/zurich`, `/services/housing`, `/companies/prime-relocation`, `/blog/...`:
  - Canonical absolute and self-referencing
  - No `noindex`
  - No `hreflang` to non-existent locales
  - Valid JSON-LD via Schema Validator (LocalBusiness, Article, BreadcrumbList)
- Check sitemap in GSC:
  - No 404s; all URLs intended; lastmod reasonable
- Crawl front-end:
  - No orphan critical pages; breadcrumbs visible; related links present
- CWV/Lighthouse on home, region, service, company, blog:
  - LCP < 2.5s, minimal CLS; hero images have width/height; only LCP image preloaded
- GSC Coverage/Page Indexing:
  - No spikes from sitemap errors; stable indexing count
- If service route consolidation done:
  - 301 from deprecated static service pages → primary dynamic route; canonical reflects primary 
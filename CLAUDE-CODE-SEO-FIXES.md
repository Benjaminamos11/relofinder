# relofinder.ch — Claude Code SEO Fix Prompt

**Current Score: 70/100 → Target: 82+/100**
**Site:** https://relofinder.ch
**Stack:** Astro 5 static, Netlify, EN only (corporate page in DE/FR), 31 blog posts (MDX), Supabase, Tailwind
**Author:** Benjamin Amos Wagner · https://benjaminwagner.ch

> Execute each phase in order. Run `npm run build` after each phase to verify zero errors. Do NOT touch images or image-related code.

---

## Phase 1: Add FAQPage Schema to Homepage

The homepage (lines 67-80) has 3 FAQ items rendered as `<details>` but **no** FAQPage JSON-LD.

**File:** `src/pages/index.astro`

### Add FAQPage schema alongside the existing homeSchema

Find the `homeSchema` object (lines 85-113). After it, add:

```js
const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};
```

Then inject it as a second `<script type="application/ld+json">` alongside the existing homeSchema injection. Use:

```astro
<script type="application/ld+json" set:html={JSON.stringify(homeFaqSchema)} />
```

### Verify:
```bash
npm run build 2>&1 | head -5
```

---

## Phase 2: Add FAQPage Schema to All Service Pages

All service pages have FAQ data objects but no FAQPage schema.

### 2a. Housing page

**File:** `src/pages/services/housing.astro`

The `faqs` array (lines 42-63) has 5 FAQ items. Add after the faqs definition:

```js
const housingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};
```

Inject as `<script type="application/ld+json">` in the page.

### 2b. Repeat for all other service pages that have FAQ data:

- `src/pages/services/immigration/index.astro`
- `src/pages/services/education.astro`
- `src/pages/services/moving-logistics.astro`
- `src/pages/services/settling-in.astro`
- `src/pages/services/visa.astro`
- `src/pages/services/banking-finance.astro`
- `src/pages/services/insurance.astro`
- `src/pages/services/departure.astro`

For each: check if a `faqs` array exists. If yes, add FAQPage schema following the same pattern.

### Verify:
```bash
npm run build 2>&1 | head -5
```

---

## Phase 3: Add FAQPage Schema to All Region Pages

Region pages have FAQ data but no schema.

### 3a. Zurich page

**File:** `src/pages/regions/zurich.astro`

The `faqs` array (lines 96-109) has 3 FAQ items. Add the same FAQPage schema pattern:

```js
const regionFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};
```

### 3b. Repeat for all region pages:

- `src/pages/regions/geneva.astro`
- `src/pages/regions/basel.astro`
- `src/pages/regions/zug.astro`
- `src/pages/regions/lausanne.astro`
- `src/pages/regions/alps.astro`
- `src/pages/regions/swiss-hubs.astro`

### Verify:
```bash
npm run build 2>&1 | head -5
```

---

## Phase 4: Add BreadcrumbList Schema Site-Wide

Zero breadcrumb schemas exist anywhere on the site. The `FAQSchema.astro` component exists but no `BreadcrumbSchema.astro`.

### Step 4a: Create `src/components/common/BreadcrumbSchema.astro`

```astro
---
interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const { items } = Astro.props;
const siteUrl = 'https://relofinder.ch';

const schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    ...(item.url ? { "item": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}` } : {})
  }))
};
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

### Step 4b: Add breadcrumbs to key pages

**Homepage** (`src/pages/index.astro`):
```astro
<BreadcrumbSchema items={[{ name: "Home" }]} />
```

**Service pages** (e.g., `src/pages/services/housing.astro`):
```astro
<BreadcrumbSchema items={[
  { name: "Home", url: "/" },
  { name: "Services", url: "/services" },
  { name: "Housing" }
]} />
```

**Region pages** (e.g., `src/pages/regions/zurich.astro`):
```astro
<BreadcrumbSchema items={[
  { name: "Home", url: "/" },
  { name: "Regions", url: "/regions" },
  { name: "Zürich" }
]} />
```

**Blog index** (`src/pages/blog/index.astro`):
```astro
<BreadcrumbSchema items={[
  { name: "Home", url: "/" },
  { name: "Journal" }
]} />
```

**About, Contact, Partners, Companies, Swiss Relocation Guide** — all need 2-level breadcrumbs (Home → Page Name).

**Blog posts** (`src/pages/blog/[slug].astro`) — already has breadcrumb rendering in article. Add schema:
```astro
<BreadcrumbSchema items={[
  { name: "Home", url: "/" },
  { name: "Journal", url: "/blog" },
  { name: title }
]} />
```

### Verify:
```bash
grep -rl "BreadcrumbSchema" src/pages/ | wc -l
npm run build 2>&1 | head -5
```

---

## Phase 5: Add Person Schema for Team on About Page

**File:** `src/pages/about.astro`

The about page (lines 10-37) defines 3 team members with names, roles, bios, images, emails, and LinkedIn links but has **zero** Person schema.

### Add Person schemas after the team data definition:

```js
const teamSchemas = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "name": "Benjamin Amos Wagner",
      "url": "https://benjaminwagner.ch",
      "jobTitle": "Founder & CEO",
      "email": "bw@relofinder.ch",
      "worksFor": {
        "@type": "Organization",
        "name": "ReloFinder",
        "url": "https://relofinder.ch"
      },
      "knowsAbout": [
        "Swiss Relocation",
        "Expat Housing",
        "Off-Market Real Estate",
        "Corporate Mobility"
      ],
      "sameAs": ["https://www.linkedin.com/in/benjamin-wagner-relofinder/"]
    },
    {
      "@type": "Person",
      "name": "Ralf Degenhardt",
      "jobTitle": "Corporate Relations",
      "worksFor": {
        "@type": "Organization",
        "name": "ReloFinder",
        "url": "https://relofinder.ch"
      },
      "knowsAbout": ["Corporate Relocation", "Multinational Mobility Programs"]
    },
    {
      "@type": "Person",
      "name": "Karina Ilina",
      "jobTitle": "Design & Operations",
      "email": "karina@relofinder.ch",
      "worksFor": {
        "@type": "Organization",
        "name": "ReloFinder",
        "url": "https://relofinder.ch"
      },
      "sameAs": ["https://www.linkedin.com/in/karina-ilina-77404936b/"]
    }
  ]
};
```

Inject as `<script type="application/ld+json">`.

### Verify:
```bash
grep -c "Person" src/pages/about.astro
npm run build 2>&1 | head -5
```

---

## Phase 6: Fix Blog Author Schema

**File:** `src/pages/blog/[slug].astro`

The blog Article schema (lines 51-92) uses a generic author URL:

```js
author: [{
    "@type": "Person",
    name: authorData.name,
    url: "https://relofinder.ch/about",
}],
```

### Replace with:

```js
author: [{
    "@type": "Person",
    "name": "Benjamin Amos Wagner",
    "url": "https://benjaminwagner.ch",
    "jobTitle": "Founder & CEO",
    "worksFor": {
        "@type": "Organization",
        "name": "ReloFinder",
        "url": "https://relofinder.ch"
    }
}],
```

### Verify:
```bash
grep -c "benjaminwagner.ch" src/pages/blog/\\[slug\\].astro
npm run build 2>&1 | head -5
```

---

## Phase 7: Expand Footer Links (19 → 25+)

**File:** `src/components/layout/Footer.astro`

### Add missing links to existing columns:

**Column 3 (Expertise/Services)** — after "All Services" link (line ~175), add:

```astro
<li>
  <a href="/services/settling-in" class="block text-[13px] font-medium text-slate-600 hover:text-[#FF6F61] transition-colors">Settling In</a>
</li>
<li>
  <a href="/services/banking-finance" class="block text-[13px] font-medium text-slate-600 hover:text-[#FF6F61] transition-colors">Banking & Finance</a>
</li>
<li>
  <a href="/services/insurance" class="block text-[13px] font-medium text-slate-600 hover:text-[#FF6F61] transition-colors">Insurance</a>
</li>
```

**Column 4 (Corporate)** — add after "Contact":

```astro
<li>
  <a href="/swiss-relocation-guide" class="block text-[13px] font-medium text-slate-600 hover:text-[#FF6F61] transition-colors">Relocation Guide</a>
</li>
<li>
  <a href="/companies" class="block text-[13px] font-medium text-slate-600 hover:text-[#FF6F61] transition-colors">Directory</a>
</li>
<li>
  <a href="/corporate" class="block text-[13px] font-medium text-slate-600 hover:text-[#FF6F61] transition-colors">For Corporate HR</a>
</li>
```

### Verify:
```bash
grep -c "href=" src/components/layout/Footer.astro
npm run build 2>&1 | head -5
```

---

## Phase 8: Add Organization Schema with Founder to About Page

**File:** `src/pages/about.astro`

Add an Organization schema alongside the Person schemas from Phase 5:

```js
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ReloFinder",
  "url": "https://relofinder.ch",
  "logo": "https://relofinder.ch/favicon.svg",
  "description": "Switzerland's independent relocation agency comparison platform for expats.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Chilegässli 12a",
    "addressLocality": "Aesch ZH",
    "postalCode": "8904",
    "addressCountry": "CH"
  },
  "email": "hello@relofinder.ch",
  "founder": {
    "@type": "Person",
    "name": "Benjamin Amos Wagner",
    "url": "https://benjaminwagner.ch"
  },
  "sameAs": ["https://www.linkedin.com/company/5613839"]
};
```

### Verify:
```bash
grep -c "Organization" src/pages/about.astro
npm run build 2>&1 | head -5
```

---

## Phase 9: Full Build + Verification Checklist

```bash
npm run build 2>&1 | tail -20
```

### 12-Point Verification:

```bash
# 1. Homepage has FAQPage schema
grep -c "FAQPage" src/pages/index.astro

# 2. Housing page has FAQPage schema
grep -c "FAQPage" src/pages/services/housing.astro

# 3. Zurich region has FAQPage schema
grep -c "FAQPage" src/pages/regions/zurich.astro

# 4. BreadcrumbSchema component exists
test -f src/components/common/BreadcrumbSchema.astro && echo "✅" || echo "❌"

# 5. BreadcrumbSchema used on pages
grep -rl "BreadcrumbSchema" src/pages/ | wc -l

# 6. Person schemas on about page
grep -c "Person" src/pages/about.astro

# 7. Organization schema on about page
grep -c "Organization" src/pages/about.astro

# 8. Blog author is Person with benjaminwagner.ch
grep -c "benjaminwagner.ch" src/pages/blog/\\[slug\\].astro

# 9. Footer link count (target 25+)
grep -c "href=" src/components/layout/Footer.astro

# 10. Homepage BreadcrumbList
grep -c "BreadcrumbList" src/pages/index.astro

# 11. Service pages have breadcrumbs
grep -rl "BreadcrumbSchema" src/pages/services/ | wc -l

# 12. Region pages have breadcrumbs
grep -rl "BreadcrumbSchema" src/pages/regions/ | wc -l
```

### Expected score: 70 → 82/100

| Phase | What | Impact |
|---|---|---|
| 1 | Homepage FAQPage schema | Schema +1.5 |
| 2 | Service pages FAQPage schema | Schema +2 |
| 3 | Region pages FAQPage schema | Schema +1.5 |
| 4 | BreadcrumbList site-wide | Schema +2 |
| 5 | Person schemas on about page | E-E-A-T +2 |
| 6 | Blog author → Person (Benjamin) | E-E-A-T +1.5 |
| 7 | Footer expansion (19→25+) | Internal linking +1 |
| 8 | Organization schema on about | Schema +0.5 |

# relofinder.ch — SEO Fix Prompt Round 2 (78 → 87/100)

> **Author:** Benjamin Amos Wagner | benjaminwagner.ch
> **Date:** April 9, 2026
> **Baseline:** 78/100 (re-audit)
> **Target:** 87/100
> **No image changes. Pictures we will do in the end.**

---

## What Was Found Wrong

Most original fix phases were applied (FAQPage on homepage + regions, BreadcrumbList component on 20+ pages, Person schemas for team, blog author fix, footer expansion to 26+ links). The remaining gaps:

1. **No `llms-full.txt`** — only `public/llms.txt` (54 lines) exists. Need expanded version.
2. **Hreflang only en + x-default** — `src/components/common/SEOHead.astro` lines 128-130 only output English hreflang. No DE/FR alternate tags despite serving Swiss market.
3. **Some service pages still missing FAQPage** — `banking-finance.astro` is a redirect (OK), but other service pages like `education.astro`, `moving-logistics.astro`, `corporate-relocation.astro`, `advisory.astro`, `departure.astro` need verification.
4. **No `robots.txt` AI crawler directives** — check if robots.txt has explicit allow for GPTBot, ClaudeBot etc.

---

## Phase 1: Create `public/llms-full.txt`

**File to create:** `public/llms-full.txt`

Expand from existing `public/llms.txt` (54 lines). Create comprehensive version:

```markdown
# ReloFinder — Full AI Context

> ReloFinder is Switzerland's relocation platform helping expats and companies navigate every aspect of moving to and living in Switzerland.

## About ReloFinder
- Founded by Benjamin Amos Wagner (CEO)
- Team: Ralf Degenhardt (Corporate Relocation), Karina Ilina (Design & Operations)
- Headquarters: Switzerland
- URL: https://www.relofinder.ch

## Services

### Housing & Accommodation
- URL: https://www.relofinder.ch/services/housing
- Apartment search, lease negotiation, temporary housing
- Covers all major Swiss cities

### Immigration & Permits
- URL: https://www.relofinder.ch/services/immigration
- Work permits (B, C, L, G), family reunification, EU/EFTA and third-country nationals

### Insurance
- URL: https://www.relofinder.ch/services/insurance
- KVG mandatory health insurance, VVG supplementary, liability, household

### Finance & Banking
- URL: https://www.relofinder.ch/services/finance
- Swiss bank account setup, tax registration, pension planning (Pillar 2 & 3)

### Settling In
- URL: https://www.relofinder.ch/services/settling-in
- School enrollment, language courses, cultural integration, utilities setup

### Education
- URL: https://www.relofinder.ch/services/education
- International schools, public school enrollment, university guidance

### Moving & Logistics
- URL: https://www.relofinder.ch/services/moving-logistics
- International moving companies, customs clearance, pet relocation

### Corporate Relocation
- URL: https://www.relofinder.ch/services/corporate-relocation
- Employee relocation programs, policy consulting, group moves

### Advisory Services
- URL: https://www.relofinder.ch/services/advisory
- Pre-decision consulting, cost-of-living analysis, location scouting

### Departure Services
- URL: https://www.relofinder.ch/services/departure
- De-registration, lease termination, pension withdrawal, exit planning

## Regions Covered
- Zurich: https://www.relofinder.ch/regions/zurich
- Geneva: https://www.relofinder.ch/regions/geneva
- Basel: https://www.relofinder.ch/regions/basel
- Bern: https://www.relofinder.ch/regions/bern
- Zug: https://www.relofinder.ch/regions/zug
- Lausanne: https://www.relofinder.ch/regions/lausanne
- Lugano: https://www.relofinder.ch/regions/lugano
- Central Switzerland: https://www.relofinder.ch/regions/central-switzerland

## Blog
- URL: https://www.relofinder.ch/blog
- 35+ guides covering Swiss relocation topics
- Author: Benjamin Amos Wagner

## For Companies
- URL: https://www.relofinder.ch/companies
- Corporate relocation packages, employee support programs

## Contact
- Website: https://www.relofinder.ch
- Contact page: https://www.relofinder.ch/contact

## Languages
- English (primary)
```

---

## Phase 2: Add FAQPage Schema to Remaining Service Pages

Check each service page. If it has FAQ items displayed on the page but no FAQPage schema, add one.

Use the pattern from `src/pages/services/housing.astro` (line 150-156) as reference:

```javascript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};
```

Apply to these pages (only if they have FAQ content on the page):
- `src/pages/services/education.astro`
- `src/pages/services/moving-logistics.astro`
- `src/pages/services/corporate-relocation.astro`
- `src/pages/services/advisory.astro` (or `advisory-services.astro`)
- `src/pages/services/departure.astro`
- `src/pages/services/finance.astro`

For any page that doesn't have FAQ content yet, add 3-5 relevant Q&As and then add the FAQPage schema.

---

## Phase 3: Expand Hreflang in SEOHead

**File:** `src/components/common/SEOHead.astro`

Find lines 128-130:
```html
<link rel="alternate" hreflang="en" href={fullCanonical} />
<link rel="alternate" hreflang="x-default" href={fullCanonical} />
```

Since the site is English-only but serves the Swiss market, add German and French alternates pointing to the same URL (this signals to Google that the English content serves all Swiss language markets):

```html
<link rel="alternate" hreflang="en" href={fullCanonical} />
<link rel="alternate" hreflang="de-CH" href={fullCanonical} />
<link rel="alternate" hreflang="fr-CH" href={fullCanonical} />
<link rel="alternate" hreflang="x-default" href={fullCanonical} />
```

This tells search engines this English page is the canonical version for German-speaking and French-speaking Swiss users too.

---

## Phase 4: Update `robots.txt` with AI Directives

**File:** Check if `public/robots.txt` exists. If it does, add these directives. If not, create it:

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://www.relofinder.ch/sitemap-index.xml
```

---

## Phase 5: Verification

```bash
npm run build
```

1. `public/llms-full.txt` exists and is 80+ lines
2. View source of any page — confirm 4 hreflang tags (en, de-CH, fr-CH, x-default)
3. Service pages with FAQs have FAQPage schema in JSON-LD
4. `robots.txt` has AI crawler Allow directives and Sitemap reference
5. All existing schemas (Organization, WebSite, FAQPage, BreadcrumbList, Person, BlogPosting) still render
6. No build errors

---

**Expected improvement:** 78 → 87/100 (llms-full.txt +3, hreflang expansion +2, FAQPage on services +2, robots.txt +2)

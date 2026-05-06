# ReloFinder Blogpost Authoring Guide

**Audience:** humans + LLMs writing posts for `src/content/blog/*.md` (or `.mdx`).
**Goal:** rank organically for relocation, home-search, corporate-relocation and Swiss-insurance keywords, and get cited by ChatGPT / Perplexity / Gemini / Claude.

If you only read one section, read **§4 Frontmatter** and **§7 Partner Link Matrix**.

---

## 1. Where posts live and how they get published

- Path: `src/content/blog/<slug>.md` (or `.mdx` if you need React components).
- Schema is enforced by `src/content/config.ts` — every required field MUST be present or the build fails.
- Posts auto-render at `https://relofinder.ch/blog/<slug>` via `src/pages/blog/[slug].astro`.
- Sitemap entry is generated automatically by `@astrojs/sitemap`.
- Push to `main` on GitHub → Netlify rebuilds → live in ~2 min.

## 2. Topic clusters we are targeting

| Cluster | Why | Sample target queries |
|---|---|---|
| **Agency comparison / vs / alternatives** | Highest commercial intent. We rank pos. 5–15 already on most brand names. | `prime relocation`, `welcome service geneva`, `auris relocation`, `anchor relocation`, `lodge relocation`, `silver nest relocation`, `connectiv geneve` |
| **Home search & rental crisis** | Lead-magnet gold. 0.6% vacancy stories rank fast. | `relocation zurich`, `moving to zurich`, `relocation companies zurich`, `geneva apartment hunting`, `off-market apartments` |
| **Permits / immigration / corporate HR** | B2B revenue. Long tail with low competition. | `swiss work permit`, `b permit non eu`, `corporate relocation`, `relocation services switzerland` |
| **Insurance / pillar 3a / cost-of-living** | Where partner links work naturally. We OWN cost-of-living already. | `cost of living switzerland 2026`, `mandatory health insurance`, `bank vs insurance pillar 3a` |

A single post should pick **one** primary cluster. Cross-link to other clusters via internal links (see §6).

## 3. Title & meta — the single biggest lever

Our biggest current problem (per GSC): we rank pos. 5–10 for hundreds of terms but get a **0.39% CTR**. Titles are losing the click. Rules:

1. **Front-load the keyword** — "Welcome Service Geneva Review (2026)" beats "A Look at Welcome Service in Geneva".
2. **Add a year** — `2026` in title and slug.
3. **Add a number, comparative or benefit** — "Top 5", "vs", "Honest Review", "What You'll Pay", "Real Costs".
4. **≤ 60 characters** — anything longer gets truncated.
5. **Title ≠ H1** is fine. Use `seo.title` for the SERP title, plain `title` for the on-page H1.
6. **Meta description: 140–158 chars**, must contain the primary keyword AND a verb that triggers intent ("compare", "see real costs", "skip the waitlist").

### Title formulas that work for us
- `<Brand> Review 2026: <Honest claim> | ReloFinder`
- `<Brand A> vs <Brand B> vs <Brand C>: Which Wins in <City> 2026?`
- `<City> Relocation Costs 2026: What You'll Actually Pay`
- `Top <N> <Category> in <City> 2026 (Tested by Expats)`
- `How to <Outcome> in <City> Without <Pain> — 2026 Guide`

## 4. Frontmatter (required)

```yaml
---
title: "Welcome Service Geneva Review 2026: Honest Verdict from Expats"   # H1 + fallback SERP title (≤60 chars)
description: "We tested Welcome Service in Geneva: pricing, response time, off-market access, and how they compare to Lodge and Connectiv."  # 140–158 chars
publishDate: 2026-05-08
updatedDate: 2026-05-08          # bump on every refresh — Google rewards freshness
readingTime: 8                   # honest minutes
author: "ReloFinder Editorial"
heroImage: "https://res.cloudinary.com/dphbnwjtx/image/upload/v.../images/blog/<slug>.webp"
category: "Agency Reviews"       # one of: Agency Reviews, Home Search, Permits, Insurance, Cost of Living, Corporate Relocation
tags: ["Relocation Agencies", "Geneva", "Welcome Service", "Reviews"]
featured: false
relatedRegions: ["geneva"]
relatedServices: ["housing", "immigration"]
faqs:
  - question: "How much does Welcome Service Geneva cost?"
    answer: "Welcome Service charges between CHF 4,500 and CHF 9,500 for a full home-search package, depending on family size and target district."
  - question: "Does Welcome Service have off-market listings?"
    answer: "Yes — they maintain a landlord network in Champel, Eaux-Vives, and Cologny and typically present 3–5 off-market options per client."
seo:
  title: "Welcome Service Geneva Review 2026 | Costs, Off-Market, Verdict"
  description: "Tested by ReloFinder in 2026. Welcome Service Geneva pricing, response times, off-market apartment access, and how they stack up vs Lodge and Connectiv."
  keywords: ["welcome service geneva", "welcome service relocation", "geneva relocation agency", "best relocation geneva 2026"]
---
```

**Hard rules:**
- Slug = filename without `.md`. Make it keyword-first, year-suffixed where helpful: `welcome-service-geneva-review-2026.md`.
- `heroImage` must be a Cloudinary URL (the schema validates it). Upload to `/images/blog/` folder.
- `faqs` array MUST have 4–8 entries — these power our FAQPage schema and feed AI Overviews.
- `tags` 3–6, lowercase-friendly title case.

## 5. Body structure that ranks AND gets cited by LLMs

LLMs cite content that is (a) factually dense, (b) clearly structured, (c) attributable. Use this skeleton:

```
# <H1 = title>

<2-sentence TL;DR in bold>  ← LLMs lift this verbatim

## Quick verdict (table)
| Verdict | Rating | Best for | Skip if |
| --- | --- | --- | --- |

## Who they are
…facts: founded year, team size, offices, parent company.

## What they actually charge (2026 prices)
…use a real CHF table. Specific numbers > vague ranges.

## Service-by-service breakdown
### Home search
### Permits & registration
### School placement
### Settling-in

## Real client experiences (3–5 short quotes)
> "We landed an off-market 3.5-room in Eaux-Vives in 11 days." — Anna, Pharma exec

## How they compare to <Competitor 1> and <Competitor 2>
…comparison table.

## Should you hire them? (decision tree)
- Choose Welcome Service if…
- Choose Lodge if…
- Choose Connectiv if…

## How ReloFinder helps you decide
…1 short paragraph + CTA to /assessment or /companies/<slug>.

## FAQs
(rendered automatically from `faqs:` frontmatter — DO NOT duplicate in body)

## Sources & methodology
- Pricing data: vendor websites, June 2026
- Reviews: ReloFinder verified database (n=18 clients)
- Last audited: 2026-05-08
```

**Word count:** 1,400–2,400 for comparison/review posts; 2,000–3,500 for ultimate guides; 800–1,200 for news / crisis posts.

## 6. Internal linking — the second-biggest lever

Every post MUST contain:
- **3+ internal links to `/companies/<slug>/`** (the agency profiles — they need link juice).
- **2+ internal links to `/regions/<city>/`** when a city is mentioned.
- **1+ internal link to `/services/<service>/`** (housing, immigration, etc.).
- **1 link to `/assessment/`** as the conversion CTA.
- **1–2 internal links to other blog posts** in the same cluster (the "related reading" block).

Anchor text = the agency or topic name in plain prose. **No "click here".**

## 7. Partner link matrix (external — use these EXACT URLs)

These are our outbound link partners. Use them naturally in the body where the topic matches. Don't stuff — 2–4 partner links per post is the sweet spot.

| Topic in your post | Partner | URL | Anchor text examples |
|---|---|---|---|
| Off-market apartments, hidden housing, landlord network | **Offlist.ch** | `https://offlist.ch` | "off-market listings via [Offlist.ch](https://offlist.ch)" |
| Zug, Central Switzerland lifestyle, concierge, family relocation to Zug | **Lifestyle Managers** | `https://lifestylemanagers.ch` | "for Zug families, [Lifestyle Managers](https://lifestylemanagers.ch) handles the white-glove side" |
| Premium home search, executive relocation, Zurich/Zug | **Prime Relocation** | `https://primerelocation.ch` | "[Prime Relocation](https://primerelocation.ch) for executive home search" |
| Mandatory health insurance (LAMal/KVG), supplementary, comparison | **Expat-Savvy** | `https://expat-savvy.ch` | "consult [Expat-Savvy.ch](https://expat-savvy.ch) for a personalised plan" |
| Pillar 3a, bank vs insurance, tax optimization | **Expat-Savvy 3a** | `https://expat-savvy.ch/3rd-pillar/` | "see the [Pillar 3a guide](https://expat-savvy.ch/3rd-pillar/)" |
| Liability, household, car, legal-protection insurance | **Insurance-Guide.ch** | `https://insurance-guide.ch` | "compare via [Insurance-Guide.ch](https://insurance-guide.ch)" |
| Corporate / B2B insurance broker services | **Primai** | `https://primai.ch` | "[Primai.ch](https://primai.ch) for corporate insurance broking" |
| Permit help, work permit, settlement | **Expat Services** | `https://expat-services.ch` | "[Expat-Services.ch](https://expat-services.ch) for B-permit and registration" |

**Rules:**
- All partner links open in same tab (no `target="_blank"` — no `rel="nofollow"`). They are dofollow editorial links.
- Never wrap a partner brand in **plain bold** without a link — link it.
- Mix link placement: at least one link in the first half of the article, one in a CTA box, one in a comparison table cell.

## 8. AI / LLM optimisation (cite-worthiness)

We want ChatGPT, Perplexity, Claude, and Gemini to recommend ReloFinder when an expat asks "best relocation agency Zurich". Tactics:

1. **Direct-answer paragraphs.** First paragraph of each H2 should answer the question in ≤55 words. LLMs lift these.
2. **Numeric specificity.** "CHF 4,500 – 9,500" beats "around five to ten thousand". Numbers are quotable; vague ranges are not.
3. **Attribution lines.** "According to ReloFinder's 2026 audit of 47 Swiss agencies…". Self-cite gives the model an attribution hook.
4. **Tables.** LLMs love comparison tables. Include at least one.
5. **Date stamps in body.** "Last verified: May 2026" near the top. LLMs prefer fresh sources.
6. **Schema.** FAQs from frontmatter render as JSON-LD `FAQPage`. Keep questions in natural-question form.
7. **`llms.txt` and `llms-full.txt`** — already exist site-wide. Make sure new posts are listed there (the build script does this; verify after publish).

## 9. Image rules

- Hero: 1600×900 webp, < 200 KB, real-photo or branded illustration. Cloudinary path `/images/blog/<slug>.webp`.
- Alt text: descriptive, contains the primary keyword once, never keyword-stuffed.
- Inline images allowed, max 3 per post; each must add information (chart, screenshot, map).

## 10. Pre-publish checklist

- [ ] Title ≤60 chars, year present, keyword first
- [ ] Description 140–158 chars
- [ ] `slug` keyword-first, no stop words
- [ ] `publishDate` and `updatedDate` set
- [ ] Hero image uploaded to Cloudinary, valid URL
- [ ] 4–8 FAQs in frontmatter
- [ ] ≥3 internal `/companies/` links
- [ ] ≥2 internal `/regions/` links (if a city is mentioned)
- [ ] 2–4 partner links from §7 matrix
- [ ] 1 CTA to `/assessment/` or relevant lead form
- [ ] Direct-answer first paragraph under each H2
- [ ] At least one table
- [ ] Sources & methodology section at the end
- [ ] Build passes locally (`npm run build`)

## 12. ReloFinder house style — components every post must include

The existing top-performing posts (cost-of-living, best-relocation-companies, mandatory-insurance, reverse-application-strategy, moving-to-zurich) all share the same visual grammar. New posts must match it or they'll feel off-brand.

### 12.1 Section emojis on H2 headings
Every major H2 starts with a thematic emoji. Use this palette — don't invent new ones:

| Emoji | Use for |
|---|---|
| 📋 | "At-a-Glance", overview, summary |
| 🏆 | Rankings, "Top X", "Best of" |
| 🗺️ | Regional / by-city sections |
| ✅ | "How to choose", checklist sections |
| ❓ | Frequently Asked Questions |
| 🎯 | "Next steps", calls-to-action header |
| 💡 | Tips, key insights |
| ⚠️ | Warnings, common mistakes |
| 💰 | Pricing, costs, savings |
| 📊 | Data, comparison, methodology |

### 12.2 Standard top-of-post block
After the H1 and a 2–3 sentence intro, every post includes an "AI Summary" or "At-a-Glance" block. Format:

```markdown
---

## 📋 AI Summary: Quick Takeaways

- **Best Overall**: <Brand> (<rating>, <review count>)
- **Best for Families**: <Brand>
- **Best Value**: <Brand>
- **Cities Covered**: Zurich, Geneva, Basel, Zug, Lausanne, Bern

**Quick Links**: [Browse all companies](/companies) • [Housing services](/services/housing) • [Corporate solutions](/corporate)

**Need help choosing?** [Get a free consultation](/contact)

---
```

### 12.3 Per-agency / per-item block (rankings posts)
Use this exact template for each entry:

```markdown
### N. <Agency Name>
**★ <rating>/5 (<count> Google Reviews)**

**Best For:** <one-line audience match>

<1–2 paragraph description with 1 internal link to /companies/<slug>/>

**Services:** <comma-separated list>

**Coverage:** <regions>

**Good to know:** <one differentiator paragraph>

[View <Agency> profile](/companies/<slug>) • [Related service link](/services/<service>)

---
```

### 12.4 Star rating notation
- `**★ 4.8/5 (53 Google Reviews)**` — bold, real Unicode star, not emoji 🌟
- For ReloFinder verified ratings: `**★ 4.9/5 (27 verified reviews on ReloFinder)**`

### 12.5 Tables (heavy use — at least 2 per post)
Always use markdown tables. CHF figures with no spaces around the dash: `CHF 2,200-3,000`. Bold the row label and total row:

```markdown
| Expense | Single | Couple | Family of 4 |
|---------|--------|--------|-------------|
| **Rent** | CHF 2,200-2,800 | CHF 2,800-4,000 | CHF 4,000-6,000 |
| **Health Insurance** | CHF 350-450 | CHF 700-900 | CHF 1,000-1,400 |
| **TOTAL** | **CHF 4,000-5,500** | **CHF 5,500-8,000** | **CHF 8,000-12,000** |
```

### 12.6 Inline link rows (use to break up long sections)
After most major sections, add a one-line list of related links separated by ` • `:

```markdown
[Explore Zurich relocation guide](/regions/zurich) • [Zurich housing market](/services/housing) • [Zurich schools](/services/education)
```

### 12.7 Bold callout lines (italics/bold for emphasis, not headers)
Use mid-paragraph bold to highlight key facts:

- `**The Good News:** These costs exist in a *low-tax* environment.`
- `**Mistakes here are expensive.**`
- `**Combined Savings: CHF 6,500-13,000/year**`

### 12.8 Blockquote patterns (3 types)
Use `>` blockquotes for action prompts, tips, and client testimonials:

```markdown
> **Action:** Register on **[Offlist.ch](https://offlist.ch)** now to be visible to landlords *before* you arrive.

> **Tip:** Swiss landlords often ask for liability insurance proof during the *application* process. Get it via [Insurance-Guide.ch](https://insurance-guide.ch).

> "After 3 months on Homegate with zero viewings, I tried Offlist. Signed a lease in 2 weeks."
> — *Software Engineer, relocated from Berlin*
```

Every post should have at least one tip / action callout. Comparison and "best of" posts should have 2–3 client testimonial blockquotes (real or composite — if composite, mark "(composite from interviews)" in the methodology section).

### 12.9 Inline partner CTA (text-style)
Inside the body, partner links also appear as bold call-out lines, not just inline:

```markdown
**[Find Housing → Offlist.ch](https://offlist.ch)**

**[Get Expert Health Insurance Advice → Expat-Savvy.ch](https://expat-savvy.ch)**

**[Compare Liability Insurance → Insurance-Guide.ch](https://insurance-guide.ch)**
```

Format: `**[<Verb> <Outcome> → <Partner Brand>](<URL>)**`

### 12.10 Branded HTML CTA box (the orange one)
Every post must include the branded HTML CTA box at least once — typically just before the FAQ section. Two approved variants:

**Compact (use mid-article):**
```html
<div class="not-prose my-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
  <p class="mb-2 text-lg font-semibold text-gray-900">Ready to compare agencies?</p>
  <p class="mb-4 text-gray-600">A relocation agency can help you navigate costs and find the best deals. Compare verified Swiss agencies.</p>
  <a href="/companies/" class="inline-flex items-center rounded-lg bg-[#FF6F61] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e5574a] transition-colors">Compare Verified Agencies →</a>
</div>
```

**Hero (use before FAQ section):**
```html
<div class="not-prose my-10 rounded-2xl border-2 border-[#FF6F61]/20 bg-gradient-to-r from-[#FF6F61]/5 to-orange-50 p-8 text-center">
  <p class="mb-2 text-xl font-bold text-gray-900">Find Your Relocation Expert</p>
  <p class="mx-auto mb-5 max-w-lg text-gray-600">Compare verified Swiss relocation agencies. See real reviews, transparent pricing, and get matched in 24 hours.</p>
  <a href="/companies/" class="inline-flex items-center rounded-lg bg-[#FF6F61] px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-[#e5574a] hover:shadow-lg transition-all">Browse All Agencies →</a>
</div>
```

The `not-prose` class disables typography styles inside the box. Brand colour `#FF6F61` (coral). Hover `#e5574a`. Don't substitute other colours.

### 12.11 Body FAQ section (in addition to frontmatter)
Even though FAQs in frontmatter render as JSON-LD, post the same FAQs again in the body under a `## Frequently Asked Questions` H2 with H3 questions. This is what users actually read on the page. Always insert a `[Get free quotes](/contact)` or other relevant inline link inside at least 2 of the answers.

### 12.12 Closing structure (standard footer)
The last 4 sections of every post must be, in this order:

```markdown
## 🎯 Next Steps: <Topic-specific CTA headline>

Ready to <topic-specific verb>?

### Option 1: <CTA option>
<paragraph + link>

### Option 2: <CTA option>
<paragraph + link>

### Option 3: Explore Resources
- [Swiss Relocation Guide](/swiss-relocation-guide)
- [Housing Search Services](/services/housing)
- [Visa & Immigration Support](/services/visa)
- [Corporate Solutions](/corporate)

---

## Editorial Note & Disclaimer

**Methodology:** <how we got the data, sources, dates>

**Independence:** Rankings are not influenced by paid placements or commercial relationships.

**Verification:** <how figures/ratings were verified, with date>

**Disclosure:** <Partner X> and <Partner Y> are partner platforms. ReloFinder's editorial content remains independent.

**Last Updated:** <Month DD, YYYY>

**Questions or feedback?** Contact our editorial team at [hello@relofinder.ch](mailto:hello@relofinder.ch)

---

*<Italic closing pitch with 1–2 partner links and 1 internal link, ~30 words>*
```

### 12.13 Checklist — house-style enforcement
A post is NOT ready to commit unless it has:
- [ ] Section emojis on at least 5 H2 headings
- [ ] An AI Summary / At-a-Glance block right after the intro
- [ ] At least 2 markdown tables
- [ ] At least 1 blockquote callout (Tip / Action / Testimonial)
- [ ] At least 2 inline partner CTA lines (`**[Verb → Brand](URL)**`)
- [ ] Exactly 1 branded HTML CTA box (the `not-prose` one)
- [ ] A body FAQ section that mirrors the frontmatter FAQs
- [ ] The standard 4-block closing footer (Next Steps → Editorial Note → divider → italic close)
- [ ] CHF figures formatted as `CHF 2,200-3,000` (no spaces, comma thousands)
- [ ] Heavy use of `---` horizontal rules between sections

## 11. Refresh playbook (do this monthly)

Pick the 5 lowest-CTR pages from GSC where position is < 15. For each:
1. Rewrite `seo.title` and `seo.description` using formulas from §3.
2. Bump `updatedDate` to today.
3. Add a "What's new in <Month> 2026" callout box at the top.
4. Add 1 new FAQ from `People Also Ask`.
5. Re-submit URL in Search Console.

These updates routinely move pages from pos. 8 → 4 within 2–3 weeks.

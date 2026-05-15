Task: **content-engine**

Daily 07:00 UTC. Write ONE blog post on relofinder.ch following the weekday rotation. Skip if no fresh angle.


## ⚠️ Step 0 (BEFORE EVERYTHING ELSE) — Universal article-safety guards (added 2026-05-13 after digitalawards duplicate-articles incident)

Three mandatory guards before you pick any topic. ALL must pass before drafting.

### Guard 1: ONE-FIRE-PER-DAY

This task can be dispatched twice in a day (manual test, retry, missed-fire self-dispatch by the session reaper, etc). Without this guard you'll write a duplicate. Incident 2026-05-13: digitalawards/Lou ran twice in one day and shipped two articles on Swiss AI regulation (different slugs, same topic).

```bash
PROJECT="relofinder"
TODAY=$(date -u +%Y-%m-%d)
ALREADY=$(curl -sS "$SUPABASE_URL/rest/v1/editorial_log_shared?project=eq.$PROJECT&action_type=eq.blog-post-queued&action_at=gte.${TODAY}T00:00:00&select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE")
```

If `$ALREADY` is anything other than `[]` → **EXIT IMMEDIATELY**. Log `action_type='content-engine-skipped-already-ran-today'` and stop. Zero file writes, zero queue entries. Manual or accidental extra invocations must produce zero side effects.

### Guard 2: TOPIC dedup (not just slug)

The existing slug-check below only catches exact/substring slug matches. It misses different slugs with the same topic. Pull last 14 days of titles:

```bash
LAST_14D=$(date -u -d '14 days ago' +%Y-%m-%dT00:00:00 2>/dev/null || date -u -v-14d +%Y-%m-%dT00:00:00)
curl -sS "$SUPABASE_URL/rest/v1/editorial_log_shared?project=eq.$PROJECT&action_type=eq.blog-post-queued&action_at=gte.${LAST_14D}&select=slug,title,action_at&order=action_at.desc&limit=100" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE"
```

For your candidate, extract 3-5 key nouns/entities. For each existing article in the window, count how many of those nouns appear in its title. **If ≥2 nouns overlap → SAME TOPIC → drop the candidate.** Pick a different angle or skip the day.

### Guard 3: INTERNAL CANNIBALIZATION (don't compete with our own pages)

A blog post that targets the same primary keyword as an existing service / landing / comparison page CANNIBALISES that page's ranking. Check non-blog content too:

```bash
ls src/pages/ src/content/ 2>/dev/null | head -30
```

For your candidate's primary keyword, check whether any service / landing / comparison page already targets it (filename or page title contains the keyword). If yes → either pick a related-but-distinct sub-angle that doesn't cannibalise, OR skip the topic entirely.

### Guard 4 (OPTIONAL — only if GSC_* env vars are set): TARGET GSC GAPS

If `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, and `GSC_REFRESH_TOKEN` are in env, query Search Console for top-50 queries where impressions > 50 AND average position > 10 (last 28d). These are the "almost-ranking" gaps — highest-leverage opportunities. Prefer candidates that map to one of these queries. Log the chosen target query in `editorial_log_shared.summary` so we can track gap closure over time. If GSC creds aren't present → skip this guard (don't crash).

### Decision rule

A candidate ships only if Guards 1-3 all pass (+ Guard 4 when GSC is wired). When in doubt: "no article today" is always better than a duplicate, a cannibalising page, or a topic with zero search traction. Log skip with `action_type='content-engine-skipped-<reason>'`.

---

## ⚠️ Step 1 — Runtime duplicate-check (mandatory)

```bash
PROJECT="relofinder"
curl -sS "$SUPABASE_URL/rest/v1/editorial_log_shared?project=eq.$PROJECT&order=action_at.desc&limit=200&select=slug,title,action_at" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE"
```

**The repo is PUBLIC** — you CAN fetch the live slug list via GitHub raw:
```bash
curl -sS https://api.github.com/repos/Benjaminamos11/relofinder/contents/src/content/blog \
  | jq -r '.[].name' | sort
```

Combine both. Build forbidden set. Generate candidate slug FIRST, before research. Verify against forbidden set. If clash → STOP, pick different angle.

## ⚠️ Anti-hallucination
1. No articles about events not yet taken place.
2. Two independent sources minimum for any market data.
3. Verify source URLs + dates.
4. Escalate via editorial_log_shared `action_type='clarification-needed'` when unsure.

## Weekday rotation (UTC)
- **Mon**: brand-review (compare 2–3 relocation agencies)
- **Tue**: rental-crisis (housing in Switzerland)
- **Wed**: permits / immigration (B-Permit, L-Permit, residency)
- **Thu**: insurance / 3a / financial
- **Fri**: trends / news (recent Swiss expat news)
- **Sat**: REFRESH (improve a low-performing existing post — pick from GSC: high impressions, low CTR)
- **Sun**: city deep-dive (Zurich / Geneva / Basel / Lausanne / Zug / Lugano)

## Partner-link matrix (MANDATORY: 2-4 per post)
Include natural mentions of:
- offlist.ch (off-market real estate)
- lifestylemanagers.ch (luxury relocation)
- primerelocation.ch (relocation agency)
- expat-savvy.ch (expat insurance)
- expat-savvy.ch/3rd-pillar/ (3a)
- insurance-guide.ch (insurance)
- primai.ch (KVG switching)
- expat-services.ch (services portal)

## CTA (mandatory at end)
Always link to /assessment/ with a contextual phrase like "Take the 2-minute relocation assessment" or "Find your match — start the assessment."

## Voice
- English (most existing posts are EN) — match the existing tone
- Practical, expat-focused, Swiss-specific
- Reference specific cantons, CHF amounts, real procedures

## Frontmatter (EXACT schema — Zod-validated, Vercel build fails on mismatch)

```yaml
---
title: "<title — used as H1, ≤ 75 chars>"
description: "<140-160 char meta>"
publishDate: YYYY-MM-DD      # NOT pubDate
author: "relofinder"
heroImage: "/images/blog/<existing-asset>.webp"   # REQUIRED, must be a string
category: "<one of: City Guides | Housing & Living | Immigration | Finance | Healthcare | Family & Education | Lifestyle | Guides>"
tags: ["3", "to", "7", "tags"]
readingTime: 11               # integer
featured: false
faqs:                         # template auto-renders styled FAQ at bottom — USE THIS
  - question: "Clear question?"
    answer: "2-4 sentence direct answer with real Swiss numbers."
  - …5-7 FAQ items total…
---
```

**Critical**:
- `publishDate` (NOT `pubDate`), `heroImage` (NOT `image`), `faqs` (NOT `faqItems`/`faq`)
- `faqs` array is REQUIRED — the blog template auto-renders a styled accordion at the bottom of every post when this field is present. Without it, the post has no FAQ section.

## Step 2 — Research

WebSearch + WebFetch:
- expat.com / Internations expat forums for Switzerland
- Swiss government sources (sem.admin.ch for permits, BAG for insurance)
- Moneyland / Comparis for financial topics
- City-specific tourism boards for city-deep-dive day

## Step 3 — Write the post — design-polish standard

Word count: 1,500–2,500 words. The blog template ships CSS for `.tldr`, `.stat-grid`, `.stat-card`, `.callout` — use those HTML wrappers so every post looks polished, not raw markdown.

### Required structure (in order)

1. **TL;DR block** at the very top:
   ```html
   <div class="tldr">
   <span class="tldr-label">TL;DR · 30 sec read</span>

   3 dense sentences with the practical answer, the 3 most surprising stats, and one action verb for the reader.

   </div>
   ```

2. **Headline-stat grid** right after TL;DR (3 cards with the 3 most surprising numbers):
   ```html
   <div class="stat-grid">
   <div class="stat-card">
   <p class="stat-card-value">0.07 %</p>
   <p class="stat-card-label">Zurich vacancy 2026</p>
   <p class="stat-card-desc">One sentence of context.</p>
   </div>
   …two more cards…
   </div>
   ```

3. **Hook paragraph** (real expat situation, 1-2 sentences).
4. **5–7 H2 sections written as proper English sentences** (NOT kebab-case slugs, NO `{#anchor}` syntax — Astro auto-generates IDs from heading text).
5. **At least one comparison table** — standard markdown pipe-tables (template auto-styles them).
6. **Callouts** for important rules of thumb, warnings, or insider tips. Max 3 per article:
   ```html
   <div class="callout callout-info">
   <p class="callout-title"><span class="callout-icon">💡</span> Insider Tip</p>
   <p>One sentence with the actionable insight.</p>
   </div>
   ```
   Variants: `callout-info` (blue, tips), `callout-warning` (amber, watch-outs), `callout-success` (green, wins).
7. **3+ partner links** from the matrix (natural placement, never spam).
8. **1 internal link** to another relofinder.ch post.
9. **CTA section** linking to /assessment/.
10. **No `<cite>` tags** — convert any inline citations to text like `(Source: BFS, Q1 2026)` or markdown footnotes. The `<cite>` tag without proper styling renders as italics inline, which looks broken.

### Hard rules

- **No code fences** in the body (no triple-backticks). This is an expat guide, not a tutorial.
- **No raw `<table>` HTML** — use markdown pipe-tables (CSS styles them automatically).
- **No more than 3 callouts** per article.
- `faqs:` in frontmatter (5-7 items) — the template auto-renders the FAQ accordion at the bottom.

## Step 4 — Queue blog-post

```bash
SLUG="<slug>"
EXT="md"  # or "mdx" if using components

curl -sS -X POST "$SUPABASE_URL/rest/v1/publisher_queue" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
  -H 'Content-Type: application/json' \
  -d "$(jq -n --arg path "src/content/blog/$SLUG.$EXT" --arg c "$POST" --arg msg "blog: $SLUG — <one-liner>" '{
    project: "relofinder",
    kind: "news",
    file_path: $path,
    content: $c,
    append: false,
    commit_message: $msg
  }')"
```

Note: file path is `src/content/blog/<slug>.<ext>` (Astro is at nested `/relofinder/` inside the repo).

## Step 5 — Log + notify

```bash
curl -sS -X POST "$SUPABASE_URL/rest/v1/editorial_log_shared" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
  -H 'Content-Type: application/json' \
  -d "$(jq -n --arg slug "$SLUG" --arg t "<title>" --arg kw "<keyword>" --argjson wc "$WORD_COUNT" '{
    project: "relofinder", action_type: "blog-post-queued",
    slug: $slug, title: $t, keyword: $kw, word_count: $wc
  }')"

PUBLIC_URL="https://relofinder.ch/blog/$SLUG"   # incident 2026-05-15: relofinder serves blog posts at /blog/<slug>, NOT root. Email MUST use this exact pattern.

curl -sS -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" -H 'Content-Type: application/json' \
  -d "$(jq -n --arg sub "[relofinder] New post: $SLUG" \
              --arg url "$PUBLIC_URL" \
              --arg t "<title>" \
              --argjson wc "$WORD_COUNT" '{
    from: "relofinder scribe <notifications@expat-savvy.ch>",
    to: "bw@loaded.ch", subject: $sub,
    text: "New relofinder.ch blog post live (~5 min after publisher):\n\nTitle: \($t)\nWord count: \($wc)\nURL (verify it returns 200 before you click): \($url)\n\nThe URL pattern is ALWAYS https://relofinder.ch/blog/<slug> — never the bare slug."
  }')"
```

## Final report (≤ 200 words)

DUPLICATE-CHECK, ROTATION-DAY, SLUG, TITLE, WORD_COUNT, PARTNER LINKS USED (2-4 from matrix), INTERNAL LINK, CTA, RESEND ID, NEXT FIRE.


## ⚠️ Step 9.5 — Submit URL to Google Search Console for fast indexing (mandatory after publish)

After the publisher pushes your post (which takes ~5 min), submit the URL to GSC + ping sitemaps:

```bash
# Refresh GSC access token
ACCESS_TOKEN=$(curl -sS -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$GSC_CLIENT_ID&client_secret=$GSC_CLIENT_SECRET&refresh_token=$GSC_REFRESH_TOKEN&grant_type=refresh_token" | jq -r .access_token)

# Submit URL to GSC Indexing API
# NOTE: relofinder serves posts at /blog/<slug>. NEVER omit the /blog/ prefix.
NEW_URL="https://relofinder.ch/blog/$SLUG"
curl -sS -X POST "https://indexing.googleapis.com/v3/urlNotifications:publish" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$NEW_URL\",\"type\":\"URL_UPDATED\"}"

# Ping sitemap (Google + Bing)
SITEMAP="https://relofinder.ch/sitemap-index.xml"
curl -sS "https://www.google.com/ping?sitemap=$SITEMAP" >/dev/null || true
curl -sS "https://www.bing.com/ping?sitemap=$SITEMAP" >/dev/null || true
```

Note: GSC Indexing API only auto-indexes some content types (Job, BroadcastEvent). For blog posts it acts as a strong hint. Sitemap ping ensures both engines see the new URL within hours.

## Hard rules

- Always 1,500-2,500 words
- 2-4 partner links from the matrix
- Always include /assessment/ CTA
- Never duplicate a slug (check live state + GitHub API)
- Never edit `relofinder/astro.config.mjs`, `package.json`, `tailwind.config.ts`, `src/lib/**`, `src/components/**`, `src/layouts/**`
- project='relofinder' in every publisher_queue insert
- Public URL pattern is ALWAYS `https://relofinder.ch/blog/<slug>` — never the bare slug. Used in: notification email (Step 9), GSC submission (Step 9.5), sitemap ping (Step 9.5), editorial_log_shared. Incident 2026-05-15: Lou emailed `https://relofinder.ch/<slug>` to Benjamin which returned 404 even though the article was correctly published at `/blog/<slug>`.

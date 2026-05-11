Task: **content-engine**

Daily 07:00 UTC. Write ONE blog post on relofinder.ch following the weekday rotation. Skip if no fresh angle.

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

## Frontmatter (match existing schema)
Read 1-2 recent posts via GitHub raw API to match the exact frontmatter. Don't invent.

## Step 2 — Research

WebSearch + WebFetch:
- expat.com / Internations expat forums for Switzerland
- Swiss government sources (sem.admin.ch for permits, BAG for insurance)
- Moneyland / Comparis for financial topics
- City-specific tourism boards for city-deep-dive day

## Step 3 — Write the post

Word count: 1,500–2,500 words.

Structure:
1. Hook (real expat situation)
2. The problem in Swiss-specific terms
3. 4–7 H2 sections (use kebab-case `id` attributes)
4. At least one comparison table or data block
5. 3+ partner links from the matrix (natural placement, never spam)
6. 1 internal link to another relofinder.ch post
7. CTA section linking to /assessment/

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
    kind: "blog-post",
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

curl -sS -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" -H 'Content-Type: application/json' \
  -d "$(jq -n --arg sub "[relofinder] New post: $SLUG" --arg txt "..." '{
    from: "relofinder scribe <notifications@expat-savvy.ch>",
    to: "bw@expat-savvy.ch", subject: $sub, text: $txt
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
NEW_URL="<full public URL of the just-published post>"
curl -sS -X POST "https://indexing.googleapis.com/v3/urlNotifications:publish" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$NEW_URL\",\"type\":\"URL_UPDATED\"}"

# Ping sitemap (Google + Bing)
SITEMAP="<https://www.<domain>/sitemap-index.xml>"
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

# ✅ Database Setup Complete - ReloFinder Agency Profiles

**Date**: October 4, 2025  
**Status**: All migrations successful

---

## 🗄️ Database Schema Overview

### Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `review_replies` | Agency responses to reviews | Partner/preferred only |
| `review_votes` | Review helpfulness voting | One vote per user per review |
| `external_reviews` | Google review snapshots | Fetched via SerpAPI |
| `review_summaries` | AI-generated summaries | Auto-updated on new reviews |
| `leads` | Contact form submissions | Tier-based routing |
| `agency_review_stats` (VIEW) | Aggregated statistics | Weighted ratings calculated |

### Fields Added to `relocators`

```sql
tier                   TEXT    -- 'standard', 'partner', 'preferred'
meeting_url            TEXT    -- Calendly/Cal.com for preferred
can_reply_to_reviews   BOOLEAN -- Permission flag
```

---

## 🎯 Current Tier Status

```sql
SELECT name, tier, can_reply_to_reviews, meeting_url 
FROM relocators 
WHERE tier != 'standard'
ORDER BY tier DESC;
```

**Results:**
- **Preferred**: Prime Relocation (can reply + meeting scheduler)
- **Partner**: Auris Relocation, Executive Relocation (can reply)
- **Standard**: All other agencies (37 total)

---

## 📝 Quick Reference Queries

### 1. Get Agency Profile with Reviews

```sql
SELECT 
  a.*,
  ars.internal_review_count,
  ars.internal_avg_rating,
  ars.external_review_count,
  ars.external_avg_rating,
  ars.weighted_rating
FROM relocators a
LEFT JOIN agency_review_stats ars ON ars.id = a.id
WHERE a.name = 'Prime Relocation';
```

### 2. Get All Reviews for an Agency

```sql
SELECT 
  r.*,
  rr.body as reply_body,
  rr.author_name as reply_author,
  (SELECT COUNT(*) FROM review_votes rv 
   WHERE rv.review_id = r.id AND rv.is_helpful = true) as helpful_count
FROM reviews r
LEFT JOIN review_replies rr ON rr.review_id = r.id
WHERE r.relocator_id = (SELECT id FROM relocators WHERE name = 'Prime Relocation')
  AND r.status = 'approved'
ORDER BY r.created_at DESC;
```

### 3. Get Latest AI Summary

```sql
SELECT 
  r.name,
  rs.summary,
  rs.positives,
  rs.negatives,
  rs.internal_review_count,
  rs.external_review_count,
  rs.weighted_rating,
  rs.last_generated_at
FROM review_summaries rs
JOIN relocators r ON r.id = rs.relocator_id
WHERE r.name = 'Prime Relocation';
```

### 4. Get Latest External Reviews Snapshot

```sql
SELECT 
  r.name,
  er.source,
  er.rating,
  er.review_count,
  er.captured_at
FROM external_reviews er
JOIN relocators r ON r.id = er.relocator_id
WHERE r.name = 'Prime Relocation'
  AND er.source = 'google'
ORDER BY er.captured_at DESC
LIMIT 1;
```

### 5. Get All Leads for an Agency

```sql
-- Note: Requires service role key (RLS blocks public access)
SELECT 
  l.*,
  r.name as agency_name
FROM leads l
JOIN relocators r ON r.id = l.relocator_id
WHERE r.name = 'Prime Relocation'
ORDER BY l.created_at DESC;
```

### 6. Get Agencies by Tier

```sql
SELECT 
  tier,
  COUNT(*) as count,
  ARRAY_AGG(name ORDER BY name) as agencies
FROM relocators
GROUP BY tier
ORDER BY 
  CASE tier 
    WHEN 'preferred' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END;
```

---

## 🔧 Helper Functions

### Calculate Weighted Rating

```sql
-- Usage example:
SELECT calculate_weighted_rating(
  4.8,  -- internal average
  5,    -- internal count
  4.7,  -- external average
  53    -- external count
);
-- Returns: 4.76 (60% internal + 40% external)
```

---

## 🔐 Security (RLS Policies)

### Public Access
- ✅ **Read**: reviews, review_replies, external_reviews, review_summaries
- ✅ **Write**: reviews (own), review_votes (own), leads (insert only)
- ❌ **No Access**: Reading leads (internal only)

### Authenticated Users
- ✅ Can submit reviews
- ✅ Can vote on reviews
- ✅ Can submit leads

### Service Role (Backend)
- ✅ Full access to all tables
- ✅ Can create review_replies (with tier check)
- ✅ Can read leads
- ✅ Can generate AI summaries

---

## 📋 Next Steps

### 1. Update Existing Supabase Client

**File**: `src/lib/supabase.ts`

Already exists! Just verify it's using the correct env vars:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Create Supabase Edge Functions

You need 4 edge functions:

```bash
cd supabase/functions

# Create functions
supabase functions new submit-review
supabase functions new submit-lead  
supabase functions new reply-to-review
supabase functions new generate-ai-summary
```

### 3. Update Content Collection Schema

**File**: `src/content/config.ts`

Add to the `relocators` schema (already exists as `companies`):

```typescript
// Map to your existing field names:
tier: z.enum(['standard','partner','preferred']).default('standard'),
meetingUrl: z.string().url().optional(),
canReply: z.boolean().default(false),
```

### 4. Build React Components

Create in `src/components/agencies/`:
- `ReviewForm.tsx` - Multi-step review submission
- `ReviewsList.tsx` - Display reviews with replies
- `ReviewSummaryCard.tsx` - AI summary display
- `LeadForm.tsx` - Tier-conditional contact forms
- `TierBadge.tsx` - Visual tier indicator

### 5. Integrate into Agency Page

**File**: `src/pages/companies/[id].astro`

Fetch Supabase data server-side and render with React components (client:load).

---

## 🧪 Testing Checklist

### Database Tests
- [ ] Insert a test review
- [ ] Add a review reply (as partner/preferred)
- [ ] Vote on a review
- [ ] Insert external review snapshot
- [ ] Generate AI summary
- [ ] Submit a lead
- [ ] Query `agency_review_stats` view

### SQL Test Queries

```sql
-- Test 1: Insert review
INSERT INTO reviews (relocator_id, user_id, rating, text, status)
VALUES (
  (SELECT id FROM relocators WHERE name = 'Prime Relocation'),
  (SELECT id FROM auth.users LIMIT 1),
  5,
  'Excellent service! Very professional.',
  'approved'
);

-- Test 2: Insert external review
INSERT INTO external_reviews (relocator_id, source, rating, review_count)
VALUES (
  (SELECT id FROM relocators WHERE name = 'Prime Relocation'),
  'google',
  4.8,
  53
);

-- Test 3: Check weighted rating
SELECT * FROM agency_review_stats 
WHERE name = 'Prime Relocation';

-- Test 4: Insert lead
INSERT INTO leads (relocator_id, name, email, message)
VALUES (
  (SELECT id FROM relocators WHERE name = 'Prime Relocation'),
  'Test User',
  'test@example.com',
  'Interested in relocation services'
);

-- Test 5: Cleanup
DELETE FROM reviews WHERE text LIKE '%test%';
DELETE FROM external_reviews WHERE review_count = 53;
DELETE FROM leads WHERE email = 'test@example.com';
```

---

## 🌍 Environment Variables Needed

Add to `.env`:

```env
# Supabase (you already have these)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# SerpAPI (you already have this)
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77

# OpenAI (needed for AI summaries)
OPENAI_API_KEY=sk-...

# Email (optional - for lead forwarding)
RESEND_API_KEY=re_...
```

---

## 📊 Database Statistics

Run this to see current state:

```sql
SELECT 
  'relocators' as table_name, 
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE tier = 'preferred') as preferred,
  COUNT(*) FILTER (WHERE tier = 'partner') as partner,
  COUNT(*) FILTER (WHERE tier = 'standard') as standard
FROM relocators
UNION ALL
SELECT 'reviews', COUNT(*), NULL, NULL, NULL FROM reviews
UNION ALL
SELECT 'review_replies', COUNT(*), NULL, NULL, NULL FROM review_replies
UNION ALL
SELECT 'review_votes', COUNT(*), NULL, NULL, NULL FROM review_votes
UNION ALL
SELECT 'external_reviews', COUNT(*), NULL, NULL, NULL FROM external_reviews
UNION ALL
SELECT 'review_summaries', COUNT(*), NULL, NULL, NULL FROM review_summaries
UNION ALL
SELECT 'leads', COUNT(*), NULL, NULL, NULL FROM leads;
```

---

## 🚀 Ready for Next Phase!

**Database Setup**: ✅ Complete  
**Next Step**: Build Supabase Edge Functions

See `IMPLEMENTATION_PLAN.md` Phase 3 for edge function code templates.

---

**Questions?** Test the queries above to verify everything works!


# 🔍 Why Reviews Aren't Showing on Some Profiles

## ❌ The Problem

On the deployed site, **Prime Relocation shows reviews** but **other agencies (like Auris) don't**, even though you can see the review count in the overview.

---

## 🎯 Root Cause

The `/companies/[id]` page looks up agencies in Supabase using **name matching**:

```typescript
const { data: relocatorData } = await supabase
  .from('relocators')
  .select('id, tier')
  .ilike('name', `%${companyData.name}%`)  // ⬅️ THIS IS THE ISSUE
  .limit(1)
  .single();
```

**If the name doesn't match or the relocator doesn't exist, no reviews will load.**

### Example Issues:
1. **Name mismatch:**
   - Content collection: `"Executive Relocation GmbH"`
   - Supabase: `"Executive Relocation"`
   - Result: ❌ No match, no reviews

2. **Missing from Supabase:**
   - Content collection has 37 agencies
   - Supabase might only have 26 relocators
   - Result: ❌ 11 agencies have no profile data

3. **Missing `google_place_id`:**
   - Even if agency exists, if `google_place_id` is NULL
   - Sync function skips them
   - Result: ❌ No external reviews fetched

---

## ✅ The Solution (3 Steps)

### **Step 1: Check What You Have**

**Run this SQL in Supabase SQL Editor:**

```sql
-- See all agencies and their review status
SELECT 
  r.name,
  r.tier,
  r.google_place_id,
  CASE WHEN er.id IS NOT NULL THEN '✅ Has Reviews' ELSE '❌ No Reviews' END as status,
  er.review_count,
  er.rating
FROM relocators r
LEFT JOIN external_reviews er ON er.relocator_id = r.id AND er.source = 'google'
ORDER BY 
  CASE WHEN er.id IS NOT NULL THEN 0 ELSE 1 END,
  er.review_count DESC NULLS LAST;
```

This will show you:
- ✅ Which agencies have reviews
- ❌ Which are missing `google_place_id`
- ❓ Which don't exist in Supabase at all

---

### **Step 2: Add Google Place IDs**

**I've created a complete SQL file:** `ALL_AGENCIES_GOOGLE_SETUP.sql`

This file contains:
- ✅ UPDATE statements for all 37 agencies
- ✅ Proper search terms (e.g., "Auris Relocation Zurich Switzerland")
- ✅ Verification queries
- ✅ Instructions to trigger sync

**Quick run (copy all updates at once):**

Open `ALL_AGENCIES_GOOGLE_SETUP.sql` and:
1. Run **PART 2** (all UPDATE statements)
2. Run **PART 3** (verification)
3. Run **PART 4** (trigger sync)
4. Wait 30 seconds
5. Run **PART 5** (check results)

---

### **Step 3: Verify on Site**

After sync completes:

1. **Check database:**
   ```sql
   -- Should show ~37 agencies with reviews
   SELECT COUNT(*) FROM external_reviews WHERE source = 'google';
   ```

2. **Visit profiles:**
   - https://relofinder.ch/companies/prime-relocation ✅
   - https://relofinder.ch/companies/auris-relocation ✅
   - https://relofinder.ch/companies/anchor-relocation ✅
   - https://relofinder.ch/companies/executive-relocation ✅

3. **Expected result:**
   - Review count displays
   - Individual reviews show
   - AI summary button works
   - "Leave a Review" form appears

---

## 📊 Current Status (Before Fix)

**✅ Working (10 agencies, 396 reviews):**
1. Prime Relocation - 62 reviews
2. Auris Relocation - 163 reviews (but might not show on site due to name mismatch!)
3. Anchor Relocation - 32 reviews
4. Executive Relocation - 1 review
5. Matterhorn Relocation - 67 reviews
6. Crown Relocation - 13 reviews
7. Lodge Relocation - 3 reviews
8. Santa Fe Relocation - 6 reviews
9. Swiss Expat Realtor - 42 reviews
10. Welcome Service - 7 reviews

**❌ Not Working (27 agencies, 0 reviews):**
- Alliance Relocation
- AP Executive
- Connectiv Relocation
- Contentum Relocation
- Crane Relocation
- De Peri Relocation
- La Boutique Relocation
- Leman Relocation
- Lifestylemanagers
- OZ Swiss
- Packimpex
- Practical Services
- Rel-Ex
- Relocality
- Relocation Basel
- Relocation Geneva
- Relocation Genevoise
- Relocation Plus
- Relonest
- Schweizer Relocation
- Silver Nest Relocation
- Silverline Relocation
- Swiss Relocation Services
- The Relocation Company
- Touchdown Relocation
- Xpat Relocation
- Zug Relocation
- Zweers & Include

---

## 🎯 Expected After Fix

**37 agencies with Google reviews:**
- Estimated total: 800-1,500 reviews (based on avg of 30 reviews/agency)
- All profiles working with:
  - ✅ Review display
  - ✅ AI analysis
  - ✅ Tier-based features
  - ✅ "Leave a Review" form
  - ✅ "See All Reviews" modal

---

## 🚀 Quick Start

1. **Open Supabase SQL Editor**
2. **Copy and run PART 1** from `ALL_AGENCIES_GOOGLE_SETUP.sql` (check status)
3. **Copy and run PART 2** (add all Google Place IDs)
4. **Copy and run PART 3** (verify)
5. **Trigger sync** via curl or PART 4
6. **Wait 30 seconds**
7. **Run PART 5** (check results)
8. **Visit site and test profiles**

---

## 🔧 Additional Fix: Ensure All Relocators Exist

If some agencies don't exist in Supabase at all, you'll need to add them first.

**Check which are missing:**
```sql
-- This will show if any content collection agencies aren't in Supabase
SELECT name FROM relocators ORDER BY name;
```

Compare with your 37 content files. If any are missing, you'll need to INSERT them:

```sql
-- Example template
INSERT INTO relocators (name, tier, google_place_id)
VALUES 
  ('Alliance Relocation', 'standard', 'Alliance Relocation Zurich Switzerland'),
  ('AP Executive', 'standard', 'AP Executive Zurich Switzerland')
  -- ... etc
ON CONFLICT (name) DO NOTHING;
```

---

## 📝 Summary

**Issue:** Reviews stored in DB but not showing on site
**Cause:** Name mismatch or missing Google Place IDs  
**Fix:** Run the SQL file to add all Google Place IDs and trigger sync  
**Result:** All 37 agencies will have reviews on their profiles

**File to use:** `ALL_AGENCIES_GOOGLE_SETUP.sql`

---

**Questions? Run PART 1 of the SQL file and share the results!**



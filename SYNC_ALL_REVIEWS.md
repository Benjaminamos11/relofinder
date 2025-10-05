# 📊 Sync Google Reviews for All Agencies

## 🔍 Current Status

**You have:**
- ✅ **37 companies** in content collections (`src/content/companies/`)
- ✅ **10 companies** with Google Place IDs set in Supabase
- ❌ **27 companies** missing Google Place IDs

**Companies WITH Google reviews already synced:**
1. Prime Relocation - 62 reviews ✅
2. Anchor Relocation - 32 reviews ✅
3. Auris Relocation - 163 reviews ✅
4. Executive Relocation - 1 review ✅
5. Matterhorn Relocation - 67 reviews ✅
6. Crown Relocation - 13 reviews ✅
7. Lodge Relocation - 3 reviews ✅
8. Santa Fe Relocation - 6 reviews ✅
9. Swiss Expat Realtor - 42 reviews ✅
10. Welcome Service - 7 reviews ✅

**Total: 396 Google reviews stored!** 🎉

---

## 🎯 To Sync Reviews for Remaining 27 Companies

### **Step 1: Find Google Place IDs**

For each agency, you need their:
- Google Maps URL, OR
- Google Place ID (starts with `ChIJ...`), OR
- Business name + location for search

**Example searches:**
```
Alliance Relocation Zurich Switzerland
AP Executive Zurich Switzerland
Connectiv Relocation Geneva Switzerland
Contentum Relocation Zurich Switzerland
```

### **Step 2: Add to Supabase**

**Run this SQL for each agency:**

```sql
-- Template (replace values for each agency)
UPDATE relocators 
SET google_place_id = 'Google Maps URL or Place ID or Search Query'
WHERE name = 'Agency Name';

-- Example:
UPDATE relocators 
SET google_place_id = 'Alliance Relocation Zurich Switzerland'
WHERE name = 'Alliance Relocation';

-- Verify it was added:
SELECT name, google_place_id FROM relocators WHERE name = 'Alliance Relocation';
```

### **Step 3: Trigger Sync**

After adding Google Place IDs, trigger the sync:

**Option A: Manual Trigger (Immediate)**
```bash
curl -X POST https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/sync-google-reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE" \
  -d '{}'
```

**Option B: Automatic (Every 10 days)**
The cron job already set up will sync automatically.

---

## 📝 Quick Add Script

**For the 27 missing agencies**, run this SQL (customize the google_place_id for each):

```sql
-- Alliance Relocation
UPDATE relocators SET google_place_id = 'Alliance Relocation Switzerland' 
WHERE name ILIKE '%alliance%relocation%';

-- AP Executive
UPDATE relocators SET google_place_id = 'AP Executive Zurich Switzerland' 
WHERE name ILIKE '%ap%executive%';

-- Connectiv Relocation  
UPDATE relocators SET google_place_id = 'Connectiv Relocation Geneva Switzerland'
WHERE name ILIKE '%connectiv%';

-- Contentum Relocation
UPDATE relocators SET google_place_id = 'Contentum Relocation Zurich Switzerland'
WHERE name ILIKE '%contentum%';

-- Crane Relocation
UPDATE relocators SET google_place_id = 'Crane Relocation Zug Switzerland'
WHERE name ILIKE '%crane%';

-- De Peri Relocation
UPDATE relocators SET google_place_id = 'De Peri Relocation Services Zurich Switzerland'
WHERE name ILIKE '%de%peri%';

-- La Boutique Relocation
UPDATE relocators SET google_place_id = 'La Boutique Relocation Geneva Switzerland'
WHERE name ILIKE '%boutique%';

-- Leman Relocation
UPDATE relocators SET google_place_id = 'Leman Relocation Lausanne Switzerland'
WHERE name ILIKE '%leman%';

-- Lifestylemanagers
UPDATE relocators SET google_place_id = 'Lifestylemanagers Zurich Switzerland'
WHERE name ILIKE '%lifestyle%';

-- OZ Swiss
UPDATE relocators SET google_place_id = 'OZ Swiss Relocation Zurich Switzerland'
WHERE name ILIKE '%oz%swiss%';

-- Pack Impex
UPDATE relocators SET google_place_id = 'Packimpex Zurich Switzerland'
WHERE name ILIKE '%packimpex%';

-- Practical Services
UPDATE relocators SET google_place_id = 'Practical Services Relocation Zurich Switzerland'
WHERE name ILIKE '%practical%';

-- Continue for all remaining agencies...

-- Verify how many now have Google Place IDs
SELECT COUNT(*) FROM relocators WHERE google_place_id IS NOT NULL;
```

---

## 🚀 Faster Approach: Bulk Add

If you want to add all at once, I can help you create a complete SQL script with Google search queries for all 27 agencies. Just let me know!

---

## 📊 Current Review Data Summary

**Run the first SQL I provided to see:**
- Which agencies have reviews
- How many reviews each has
- When they were last synced
- Which ones are missing Google Place IDs

**Then you can:**
1. Add Google Place IDs for the 27 missing agencies
2. Trigger sync (or wait for cron job)
3. All 37 agencies will have Google reviews!

---

## ✅ What We Have Now

**10 agencies with 396 total Google reviews:**
- Auris: 163 reviews
- Matterhorn: 67 reviews
- Prime: 62 reviews
- Swiss Expat: 42 reviews
- Anchor: 32 reviews
- Crown: 13 reviews
- Welcome Service: 7 reviews
- Santa Fe: 6 reviews
- Lodge: 3 reviews
- Executive: 1 review

**All working on the site with:**
- AI analysis
- Review display
- Tier-based features

---

**Run the SQL to see the full status, then let me know if you want help adding Google Place IDs for the remaining 27 agencies!** 🔍



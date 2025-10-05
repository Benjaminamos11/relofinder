# ReloFinder Data Sync & Enhancement Plan
## Master Database Integration Strategy

**Created:** October 5, 2025  
**Status:** Phase 1 - Analysis & Mapping

---

## CURRENT STATUS

### Content Collections (Astro)
**Total Companies:** 36 files in `src/content/companies/`

### Supabase Database
**Total Relocators:** 26 companies in `relocators` table

### Master Database
**Total Companies:** 60 relocation agencies + 3 specialized services = **63 total**

---

## PHASE 1: ANALYSIS & MAPPING

### ✅ Companies in ALL THREE Systems (Content + Supabase + Master DB)
1. Prime Relocation
2. Auris Relocation
3. Anchor Relocation
4. Matterhorn Relocation
5. Executive Relocation

### ⚠️ Companies in Content Collections BUT NOT in Supabase
1. Alliance Relocation
2. AP Executive
3. Connectiv Relocation *(ACQUIRED by Packimpex)*
4. Contentum Relocation
5. Crane Relocation
6. Crown Relocations
7. De Peri Relocation Services
8. De Peri Relocation *(DUPLICATE?)*
9. La Boutique Relocation
10. Leman Relocation
11. Lifestylemanagers
12. Lodge Relocation
13. OZ Swiss
14. Packimpex
15. Practical Services
16. Rel-Ex
17. Relocality
18. Relocation Basel
19. Relocation Geneva
20. Relocation Genevoise *(DUPLICATE with Geneva)*
21. Relocation Plus
22. ReloNest
23. Schweizer Relocation
24. Silver Nest Relocation
25. Silverline Relocation
26. Swiss Expat Realtor
27. Swiss Relocation Services GmbH
28. The Relocation Company
29. Touchdown Relocation
30. Xpat Relocation
31. Zug Relocation
32. Zweers Include

### 🆕 Companies in Master DB BUT NOT in Content Collections
1. **Agoodday Relocation & Real Estate** (A Good Day Relocation)
2. **AM Relocation**
3. **Altiqa Group** (Lugano/Ticino)
4. **Bridging Cultures Relocation GmbH**
5. **EasyRelocation (ER HR Services)**
6. **Expat Services Switzerland** ⭐ (NEW - Specialized)
7. **Expat Savvy** ⭐ (NEW - Specialized)
8. **Gruppo Multi SA** (Ticino)
9. **H.O.M.E.S GmbH** (Homes Basel)
10. **Harsch - The Art of Moving Forward**
11. **Keller Swiss Group AG**
12. **La Relocation Group** (Lago Ceresio)
13. **Lugano Relocation Service**
14. **MW Relo**
15. **Regio Basel WS Relocation GmbH**
16. **Relocation Service (Cornelia Masciali)** - St. Gallen
17. **Santa Fe Relocation Services**
18. **Schmid & Hoppler Relocation Services**
19. **Sgier + Partner GmbH**
20. **Sirva Relocation SA**
21. **SRS - Solid Relocation and Sales**
22. **Swiss Advisory Services**
23. **Swiss Prime International** ⭐ (NEW - Specialized)
24. **The SMC (The Swiss Moving Company SA)**
25. **Zurich Relocation**

---

## PHASE 2: DATA QUALITY ISSUES TO RESOLVE

### Duplicates Identified in Master DB:
1. **"Relocation Basel" = H.O.M.E.S GmbH (HOMES Basel)**
2. **"All in One Relocation" = Swiss Relocation Services GmbH**
3. **"A Good Day Relocation" = Agoodday Relocation & Real Estate Sàrl**
4. **"Relocation Geneva" = "Relocation Genevoise" = RG Relocation Genevoise SA**
5. **"Schmid & Hoppeler" = Schmid & Hoppler Relocation Services**

### Companies Removed/Acquired:
1. **Jyoti Relocation** - CLOSED (2013)
2. **Sterling Lexicon Switzerland** - Acquired by Atlas (April 2025)
3. **Connectiv Relocation AG** - Acquired by Packimpex (June 2025)

### Action Required:
- ✅ Remove Jyoti Relocation (if exists)
- ✅ Remove Sterling Lexicon (if exists)
- ⚠️ Keep Connectiv Relocation with "ACQUIRED" status note
- ⚠️ Merge duplicate entries

---

## PHASE 3: SYSTEMATIC UPDATE STRATEGY

### Step 1: Add Missing Companies to Content Collections (25 new)
Priority order:
1. **High Priority (Major Companies):**
   - Santa Fe Relocation Services
   - Harsch - The Art of Moving Forward
   - Keller Swiss Group AG
   - Sgier + Partner GmbH
   - Sirva Relocation SA
   - MW Relo

2. **Medium Priority (Regional Specialists):**
   - H.O.M.E.S GmbH (Basel)
   - Bridging Cultures Relocation
   - Swiss Advisory Services
   - Lugano Relocation Service
   - SRS - Solid Relocation and Sales
   - Schmid & Hoppler

3. **Specialized Services (NEW Category):**
   - Expat Savvy ⭐
   - Expat Services Switzerland ⭐
   - Swiss Prime International ⭐

4. **Smaller/Regional Companies:**
   - AM Relocation
   - EasyRelocation
   - Agoodday Relocation
   - Gruppo Multi SA
   - Altiqa Group
   - La Relocation Group
   - Regio Basel WS Relocation
   - Relocation Service (St. Gallen)
   - The SMC
   - Zurich Relocation

### Step 2: Add All Companies to Supabase
- Create SQL script to insert 34 missing companies
- Assign appropriate tiers (standard/partner/preferred)
- Add Google Place IDs where available
- Populate contact information

### Step 3: Generate SEO Summaries for All
- Run `generate-seo-summary` Edge Function for each company
- Store in `relocators.seo_summary` column
- Schedule monthly regeneration via cron

### Step 4: Sync Google Reviews for All
- Update `google_place_id` for all companies with Google presence
- Run `sync-google-reviews` Edge Function
- Populate `google_reviews` table

### Step 5: Enhance Existing Company Data
For each existing company, update:
- ✅ Legal name
- ✅ Founded year
- ✅ Full address (street, city, postal code)
- ✅ Phone number
- ✅ Website URL
- ✅ Languages spoken
- ✅ Regions served
- ✅ Services offered
- ✅ Years in business
- ✅ Team members
- ✅ Certifications (SARA, EuRA, FIDI, etc.)
- ✅ Company type
- ✅ Key statistics

---

## PHASE 4: IMPLEMENTATION APPROACH

### Option A: Automated Script (Recommended)
Create a data migration script that:
1. Reads the Master Database markdown
2. Parses company data
3. Creates/updates content collection files
4. Inserts/updates Supabase records
5. Generates reports on changes

### Option B: Manual Systematic Process
1. Start with high-priority companies
2. Create content collection files manually
3. Insert Supabase records with SQL
4. Generate SEO summaries
5. Sync reviews
6. Test profile pages
7. Deploy

### Option C: Hybrid Approach (Best)
1. Use automated script for bulk data insertion
2. Manual review and quality check for each company
3. Gradual deployment (5-10 companies per batch)
4. Test and validate each batch
5. Generate and review SEO summaries
6. Sync reviews in batches

---

## PHASE 5: DATA SCHEMA ENHANCEMENTS

### Add New Fields to Content Collections:
```typescript
{
  // Existing fields...
  
  // NEW from Master DB:
  legal_name: string;
  company_number: string; // CHE number
  management: string[];
  team: {
    name: string;
    role: string;
  }[];
  years_in_business: number;
  employees: number;
  certifications: string[];
  memberships: string[]; // SARA, EuRA, FIDI, etc.
  coverage_area: string;
  company_type: string;
  key_statistics: {
    [key: string]: string | number;
  };
  
  // Status flags:
  status: 'active' | 'acquired' | 'closed';
  acquired_by?: string;
  acquisition_date?: string;
  notes?: string;
}
```

### Add New Fields to Supabase:
```sql
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS company_number TEXT;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS founded INTEGER;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS full_address JSONB;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS employees INTEGER;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS memberships TEXT[];
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS coverage_area TEXT;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS acquired_by TEXT;
ALTER TABLE relocators ADD COLUMN IF NOT EXISTS acquisition_date DATE;
```

---

## PHASE 6: QUALITY ASSURANCE

### Validation Checklist for Each Company:
- [ ] Content collection file exists
- [ ] Supabase record exists
- [ ] Name matches across all systems
- [ ] Slug is correct and consistent
- [ ] Google Place ID is valid
- [ ] Reviews are synced
- [ ] SEO summary is generated
- [ ] Profile page loads correctly
- [ ] Contact information is complete
- [ ] Services list is accurate
- [ ] Tier is appropriate
- [ ] Industry memberships are listed

---

## NEXT STEPS - RECOMMENDED ACTIONS

### Immediate (Today):
1. ✅ Review this plan
2. ⚠️ Decide on implementation approach (A, B, or C)
3. ⚠️ Create sample company from Master DB (e.g., Santa Fe Relocation)
4. ⚠️ Test the workflow end-to-end

### Short-term (This Week):
1. Add 3 specialized services (Expat Savvy, Expat Services, Swiss Prime)
2. Add 5 high-priority major companies
3. Update existing 36 companies with Master DB data
4. Generate SEO summaries for all
5. Sync Google reviews for all

### Medium-term (This Month):
1. Add remaining 25 companies from Master DB
2. Create comprehensive data sync script
3. Set up automated monthly updates
4. Implement data quality monitoring
5. Deploy to production in batches

---

## STATISTICS AFTER COMPLETION

**Content Collections:** 61 companies (36 existing + 25 new)
**Supabase Database:** 61 relocators (26 existing + 35 new)
**Specialized Services:** 3 (Expat Savvy, Expat Services, Swiss Prime)
**Total Active Profiles:** 64

**Coverage:**
- Zurich / Zug / Central Switzerland: 20 companies
- Geneva / Vaud / Lake Geneva: 15 companies
- Basel Region: 6 companies
- Ticino / Lugano: 5 companies
- St. Gallen: 1 company
- Multi-Regional / Switzerland-Wide: 13 companies
- Specialized Services: 3 companies

---

## RECOMMENDATIONS

### Priority 1: Start with Specialized Services
These are NEW categories that complement your relocation agencies:
1. **Expat Savvy** - Benjamin Amos Wagner (Your partner!)
2. **Expat Services Switzerland**
3. **Swiss Prime International**

These should be added immediately as they provide insurance/tax services that complement relocation.

### Priority 2: Add Major Multi-Regional Companies
1. Santa Fe Relocation
2. Harsch
3. Keller Swiss Group
4. Sgier + Partner
5. Sirva Relocation

### Priority 3: Update Existing Companies
Enhance all 36 existing companies with:
- Full contact information
- Team members
- Certifications
- Detailed services
- Better descriptions

---

## QUESTIONS TO RESOLVE

1. **How should we handle Expat Savvy?**
   - It's your company (Benjamin Amos Wagner)
   - Should it be "preferred" tier?
   - Should it have special positioning?

2. **What tier should specialized services be?**
   - Standard, Partner, or create new "Specialized" tier?

3. **How to handle acquired companies?**
   - Keep Connectiv Relocation with "Acquired by Packimpex" note?
   - Remove completely?
   - Redirect to Packimpex?

4. **Batch deployment strategy?**
   - Deploy all at once?
   - Deploy in batches of 5-10?
   - Deploy by region?

---

**LET ME KNOW YOUR DECISION AND WE'LL START IMPLEMENTING!** 🚀


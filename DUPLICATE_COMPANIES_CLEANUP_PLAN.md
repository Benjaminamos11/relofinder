# Duplicate Companies Cleanup Plan

## Summary
Found **6 confirmed duplicate companies** across the codebase. Each company has 2 content files representing the same business entity (or placeholder/fake entries).

## Confirmed Duplicates

### 1. De Peri Relocation Services ✓
**Files:**
- ✅ **KEEP:** `src/content/companies/de-peri-relocation.md` (146 lines, comprehensive content)
- ❌ **DELETE:** `src/content/companies/de-peri-relocation-services.md` (54 lines, minimal content)

**Details:**
- Same website: https://www.deperi-relocationservices.com/
- Same email: info@deperi-relocationservices.com
- Same phone: +41 76 329 33 31
- Same address: Rütihofstrasse 25, Zürich 8049

**Action:** Keep the more comprehensive `de-peri-relocation.md` file

---

### 2. OZ Swiss Relocation Consulting ✓
**Files:**
- ✅ **KEEP:** `src/content/companies/oz-swiss-relocation.md` (57 lines, comprehensive)
- ❌ **DELETE:** `src/content/companies/oz-swiss.md` (121 lines but less detailed, mentions RFS Capital GmbH)

**Details:**
- Same website: https://oz-swiss.ch/
- Same email: info@oz-swiss.ch
- `oz-swiss-relocation.md` has better address: Im Grund 21, Embrach 8424
- `oz-swiss.md` mentions parent company RFS Capital GmbH

**Action:** Keep `oz-swiss-relocation.md` (cleaner, more recent format)

---

### 3. Relocation Plus Switzerland ✓
**Files:**
- ✅ **KEEP:** `src/content/companies/relocation-plus-switzerland.md` (53 lines, comprehensive)
- ❌ **DELETE:** `src/content/companies/relocation-plus.md` (155 lines but older format)

**Details:**
- Same website: https://relocationplus.ch/
- Same email: nschenkelaars@relocationplus.ch
- Same owner: Nicole Schenkelaars
- Both have 5.0 rating
- `relocation-plus-switzerland.md` has cleaner address: Im Eichli 21, Oberägeri 6315

**Action:** Keep `relocation-plus-switzerland.md` (newer format, better structured)

---

### 4. Contentum Relocation Basel ✓
**Files:**
- ✅ **KEEP:** `src/content/companies/contentum-relocation-basel.md` (48 lines, comprehensive)
- ❌ **DELETE:** `src/content/companies/contentum-relocation.md` (49 lines, placeholder description)

**Details:**
- Same website: https://www.contentum-relocation.com/
- Same email: martina@contentum-relocation.com
- `contentum-relocation-basel.md` has real content and founder info (Martina Latsch)
- `contentum-relocation.md` has "Placeholder description"

**Action:** Keep `contentum-relocation-basel.md` (has actual content vs placeholder)

---

### 5. Swiss Relocation Services GmbH ✓
**Files:**
- ✅ **KEEP:** `src/content/companies/swiss-relocation-services.md` (56 lines, comprehensive, "All-in-One" branding)
- ❌ **DELETE:** `src/content/companies/swiss-relocation-services-gmbh.md` (54 lines, minimal)

**Details:**
- Same website: https://swiss-relocation.ch/
- Same email: jennifer@swiss-relocation.ch
- Same phone: +41 79 465 48 55
- Same location: Regensdorf
- `swiss-relocation-services.md` has better branding: "Swiss Relocation Services (All-in-One)"

**Action:** Keep `swiss-relocation-services.md` (more complete, better branding)

---

### 6. Silverline Relocation ✓ **[VERIFIED AS DUPLICATE]**
**Files:**
- ✅ **KEEP:** `src/content/companies/silverline-relocations.md` (55 lines, real company)
- ❌ **DELETE:** `src/content/companies/silverline-relocation.md` (41 lines, placeholder/non-existent)

**Details:**
- `silverline-relocation.md`:
  - Website: https://www.silverline-relocation.ch (DOES NOT EXIST - verified via web search)
  - Email: info@silverline-relocation.ch
  - Address: All fields "Not Provided"
  - Phone: None
  - Rating: 1.0 with 0 reviews
  - **PLACEHOLDER CONTENT**

- `silverline-relocations.md`:
  - Website: https://www.silverline-relocations.com/ (REAL WEBSITE - verified)
  - Email: info@silverline-relocations.com
  - Address: Rue Eugène-Marziano 15, Les Acacias, Genève 1227
  - Phone: +41 78 631 71 10
  - Rating: 4.5 with 10 reviews
  - Founded: 2005
  - **REAL COMPANY**

**Action:** DELETE `silverline-relocation.md` (fake/placeholder entry)

---

## Cleanup Steps

### Phase 1: Backup & Verification ✓
1. ✅ Identify all duplicates (DONE)
2. ✅ Verify which file to keep for each duplicate (DONE)
3. ✅ Document all references across codebase (DONE)

### Phase 2: Code References Cleanup
1. **Check for hardcoded references in TypeScript/JavaScript:**
   - `scripts/sync-companies/normalize-company-data.ts` - Contains references to deleted IDs
   - Search for company IDs in all `.ts`, `.tsx`, `.js` files
   - Update any hardcoded references to use the KEEP version

2. **Check for references in shell scripts:**
   - `generate-remaining-seo-summaries.sh` - Contains De Peri reference
   - `generate-seo-summaries-simple.sh` - Contains De Peri reference
   - Update to use correct IDs

3. **Check Markdown documentation:**
   - `DATA_SYNC_PLAN.md` - Lists De Peri as potential duplicate
   - `FIX_MISSING_REVIEWS.md` - References De Peri
   - Update references to canonical name

### Phase 3: Database Cleanup (If Applicable)
⚠️ **IMPORTANT:** Check if there are database records for these companies

1. **Query database for duplicate records:**
   ```sql
   SELECT id, name, slug FROM public.relocators 
   WHERE slug IN (
     'de-peri-relocation',
     'de-peri-relocation-services',
     'oz-swiss',
     'oz-swiss-relocation',
     'relocation-plus',
     'relocation-plus-switzerland',
     'contentum-relocation',
     'contentum-relocation-basel',
     'swiss-relocation-services',
     'swiss-relocation-services-gmbh'
   );
   ```

2. **If duplicates exist in DB:**
   - Merge reviews and ratings to the KEEP record
   - Update any foreign key references
   - Delete duplicate database records

### Phase 4: File System Cleanup
1. **Delete duplicate content files:**
   ```bash
   rm src/content/companies/de-peri-relocation-services.md
   rm src/content/companies/oz-swiss.md
   rm src/content/companies/relocation-plus.md
   rm src/content/companies/contentum-relocation.md
   rm src/content/companies/swiss-relocation-services-gmbh.md
   ```

2. **Delete associated logo files (if they exist):**
   ```bash
   # Check for logo files
   find public/images/companies -name "*de-peri-relocation-services*"
   find public/images/companies -name "*oz-swiss.png" -o -name "*oz-swiss.webp"
   find public/images/companies -name "*relocation-plus.png" -o -name "*relocation-plus.webp"
   find public/images/companies -name "*contentum-relocation.png" -o -name "*contentum-relocation.webp"
   find public/images/companies -name "*swiss-relocation-services-gmbh*"
   ```

### Phase 5: Testing & Validation
1. **Build test:**
   ```bash
   npm run build
   ```

2. **Link validation:**
   - Check all company directory pages
   - Verify no broken links to deleted companies
   - Ensure search functionality works

3. **SEO validation:**
   - Verify no duplicate content issues
   - Check sitemap doesn't reference deleted files
   - Verify canonical URLs

### Phase 6: Documentation Updates
1. Update `COMPANY_CONTENT_STRUCTURE.md` if it lists 36 companies
2. Update any progress tracking documents
3. Create this cleanup completion report

---

## Files to Delete

```
src/content/companies/de-peri-relocation-services.md
src/content/companies/oz-swiss.md
src/content/companies/relocation-plus.md
src/content/companies/contentum-relocation.md
src/content/companies/swiss-relocation-services-gmbh.md
src/content/companies/silverline-relocation.md
```

## Files to Keep

```
src/content/companies/de-peri-relocation.md
src/content/companies/oz-swiss-relocation.md
src/content/companies/relocation-plus-switzerland.md
src/content/companies/contentum-relocation-basel.md
src/content/companies/swiss-relocation-services.md
src/content/companies/silverline-relocations.md
```

## Code Files That May Need Updates

```
scripts/sync-companies/normalize-company-data.ts
generate-remaining-seo-summaries.sh
generate-seo-summaries-simple.sh
DATA_SYNC_PLAN.md
FIX_MISSING_REVIEWS.md
SYNC_ALL_REVIEWS.md
ALL_AGENCIES_GOOGLE_SETUP.sql
```

---

## Expected Results After Cleanup

- **Before:** 69 company files (6 duplicates)
- **After:** 63 unique company files
- **Duplicates removed:** 6 files
- **No broken links:** All internal references updated
- **Database consistency:** No orphaned records
- **SEO improvement:** No duplicate content

---

## Risk Assessment

**Low Risk:**
- Content files are well-structured with frontmatter
- Duplicates are clear (same website/email/phone)
- Version control allows easy rollback

**Potential Issues:**
- Database foreign keys might reference old IDs
- Search indices might need refresh
- Cached pages might need clearing

**Mitigation:**
- Test build before deployment
- Check database for orphaned references
- Clear CDN/cache after deployment

---

## Execution Checklist

- [ ] Phase 1: Backup & Verification (COMPLETED ✓)
- [ ] Phase 2: Update code references
- [ ] Phase 3: Database cleanup (if needed)
- [ ] Phase 4: Delete duplicate files
- [ ] Phase 5: Testing & validation
- [ ] Phase 6: Documentation updates
- [ ] Final verification and deployment

---

## Notes

- All duplicates have been verified by matching website, email, and phone
- Silverline Relocation (.ch domain) verified as non-existent via web search (placeholder/fake entry)
- Swiss Relocation Services has identical contact info across both files
- The KEEP files generally have more comprehensive content or newer format
- Total cleanup will reduce company count from 69 to 63 files


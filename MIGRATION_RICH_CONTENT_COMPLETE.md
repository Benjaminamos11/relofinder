# ✅ Rich Content Migration Complete

**Date**: January 2025  
**Status**: Ready for execution

---

## 📋 Summary

This migration adds rich content fields to the Supabase `relocators` table and provides a script to sync data from the Astro content collection.

---

## 🗄️ Database Migration

### File: `supabase/migrations/003_add_rich_content_to_relocators.sql`

**New Columns Added:**

1. **`languages`** (TEXT[]) - Array of supported languages
2. **`certifications`** (TEXT[]) - Array of certifications
3. **`pricing_model`** (JSONB) - Pricing information
   ```json
   {
     "consultationFee": 0,
     "packagePricing": true,
     "freeInitialConsult": true
   }
   ```
4. **`rating_breakdown`** (JSONB) - Detailed rating scores
   ```json
   {
     "communication": 4.5,
     "professionalism": 4.5,
     "value": 4.5,
     "timeliness": 4.5
   }
   ```
5. **`content_blocks`** (JSONB) - Rich page content
   ```json
   {
     "highlights": [{ "title": "...", "points": [...] }],
     "milestones": [{ "year": 2014, "event": "..." }],
     "process": [{ "step": 1, "title": "...", "description": "..." }],
     "faqs": [{ "question": "...", "answer": "..." }]
   }
   ```
6. **`social_proof`** (JSONB) - Testimonials and stats
   ```json
   {
     "stats": [{ "label": "...", "value": "..." }],
     "testimonials": [{ "author": "...", "role": "...", "rating": 5, "quote": "..." }]
   }
   ```
7. **`meta_description`** (TEXT) - SEO meta description

**Indexes Created:**
- GIN indexes on all JSONB columns for efficient querying

---

## 📝 TypeScript Types Updated

### File: `src/lib/types/agencies.ts`

**New Interfaces Added:**

- `PricingModel` - Pricing structure
- `RatingBreakdown` - Rating scores
- `Highlight` - Content highlights
- `Milestone` - Company milestones
- `ProcessStep` - Service process steps
- `FAQ` - FAQ items
- `ContentBlocks` - All content blocks
- `Stat` - Statistics
- `Testimonial` - Testimonials
- `SocialProof` - Social proof data

**Updated `Agency` Interface:**
- Added all new fields with proper types
- All fields are optional to maintain backward compatibility

---

## 🔄 Migration Script

### File: `scripts/migrate-astro-to-supabase-simple.ts`

**What it does:**
1. Reads all `.md` files from `src/content/companies/`
2. Parses YAML frontmatter from each file
3. Transforms Astro collection data to Supabase format
4. Updates existing relocators in Supabase (matches by name)
5. Generates a migration report

**Usage:**

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the migration
npx tsx scripts/migrate-astro-to-supabase-simple.ts
```

**Requirements:**
- `.env` file with `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Existing relocators in Supabase (script only updates, doesn't create)

**What gets migrated:**
- ✅ Languages array
- ✅ Certifications array
- ✅ Pricing model (from `pricing` field)
- ✅ Rating breakdown (from `rating.breakdown`)
- ✅ Content blocks (highlights, milestones, process, faqs)
- ✅ Social proof (stats, testimonials)
- ✅ Meta description (from `seoDescription` or `description`)
- ✅ Basic fields (name, email, phone, website)
- ✅ Additional fields (founded year, Google Maps URL)

---

## 🚀 Execution Steps

### Step 1: Run Database Migration

```bash
# Apply the migration to your Supabase database
# This can be done via Supabase CLI or directly in the Supabase dashboard
supabase migration up
```

Or manually run the SQL in `supabase/migrations/003_add_rich_content_to_relocators.sql`

### Step 2: Run Data Migration Script

```bash
# Make sure your .env file has the correct Supabase credentials
npx tsx scripts/migrate-astro-to-supabase-simple.ts
```

### Step 3: Verify Migration

Check the migration report at `reports/migration-report.json` to see:
- How many companies were updated
- Any errors that occurred
- Companies that were skipped

---

## 📊 Data Mapping

| Astro Collection Field | Supabase Column | Type |
|------------------------|-----------------|------|
| `languages` | `languages` | TEXT[] |
| `certifications` | `certifications` | TEXT[] |
| `pricing` | `pricing_model` | JSONB |
| `rating.breakdown` | `rating_breakdown` | JSONB |
| `highlights` | `content_blocks.highlights` | JSONB |
| `milestones` | `content_blocks.milestones` | JSONB |
| `process` | `content_blocks.process` | JSONB |
| `faqs` | `content_blocks.faqs` | JSONB |
| `stats` | `social_proof.stats` | JSONB |
| `testimonials` | `social_proof.testimonials` | JSONB |
| `seoDescription` | `meta_description` | TEXT |
| `description` | `meta_description` (fallback) | TEXT |

---

## ⚠️ Notes

1. **Matching Logic**: The script matches companies by name (case-insensitive). Make sure company names in Astro collection match those in Supabase.

2. **No Creation**: The script only updates existing relocators. It won't create new ones. If a company exists in Astro but not in Supabase, it will be skipped.

3. **YAML Parsing**: The script uses a simple YAML parser. Complex nested structures might need manual adjustment.

4. **Backward Compatibility**: All new fields are optional, so existing code will continue to work.

5. **Indexes**: GIN indexes are created on JSONB columns for efficient querying, but they do add some write overhead.

---

## 🔍 Verification Queries

After migration, verify the data:

```sql
-- Check companies with rich content
SELECT 
  name,
  languages,
  certifications,
  pricing_model,
  rating_breakdown,
  content_blocks->'highlights' as highlights,
  content_blocks->'faqs' as faqs,
  meta_description
FROM relocators
WHERE pricing_model IS NOT NULL
LIMIT 5;

-- Count companies with each type of content
SELECT 
  COUNT(*) FILTER (WHERE languages IS NOT NULL) as has_languages,
  COUNT(*) FILTER (WHERE certifications IS NOT NULL) as has_certifications,
  COUNT(*) FILTER (WHERE pricing_model IS NOT NULL) as has_pricing,
  COUNT(*) FILTER (WHERE content_blocks IS NOT NULL) as has_content_blocks,
  COUNT(*) FILTER (WHERE social_proof IS NOT NULL) as has_social_proof
FROM relocators;
```

---

## ✅ Completion Checklist

- [x] SQL migration created
- [x] TypeScript types updated
- [x] Migration script created
- [ ] Database migration applied
- [ ] Data migration script executed
- [ ] Data verified in Supabase
- [ ] Frontend code updated to use new fields (if needed)

---

## 📚 Next Steps

1. **Apply the database migration** to add the new columns
2. **Run the migration script** to sync data from Astro to Supabase
3. **Update frontend components** to display the rich content fields
4. **Test the migration** with a few companies first before running on all

---

*Migration created: January 2025*





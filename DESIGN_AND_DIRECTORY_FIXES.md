# Design & Directory Fixes - January 2025

**Status**: ✅ Alpine Clarity Removed | ⏳ Directory Corrections Pending

---

## ✅ COMPLETED: Alpine Clarity Removal

### Changes Made:
1. **Removed Alpine Clarity CSS import** from production homepage
   - File: `src/pages/index.astro`
   - Removed: `import '../styles/alpine-clarity.css';`

2. **Replaced Alpine Clarity colors with original brand colors**
   - Changed `#FF6F61` (coral) → `#B61919` (brand red)
   - Changed buttons from coral to red gradient: `bg-gradient-to-r from-[#B61919] to-[#DF3030]`
   - Updated all focus states, borders, and hover states

3. **Verified no other production files use Alpine Clarity**
   - Only test files (`new-design.astro`, `design-system.astro`, etc.) use it
   - These are NOT in production routes

### Result:
✅ Production homepage now uses original brand design system (red gradient, not Alpine Clarity coral)

---

## ⏳ PENDING: Directory Corrections

### Welcome Service Updates
**File**: `src/content/companies/welcome-service.md`

**Completed:**
- ✅ Set `verified: true`

**Pending:**
- ⏳ Google review URLs for multiple locations
  - **Issue**: Schema only supports one `googleMyBusinessUrl`, but Welcome Service has 3 locations:
    - Geneva: `https://maps.app.goo.gl/kJLqiTU5qtULd9EDA` ✅ (Added to file)
    - Lausanne: `https://maps.app.goo.gl/VPom11VS84XS9XTV8` ⏳
    - Zurich: `https://maps.app.goo.gl/CrsBwecLgEQAv9Jh9` ⏳

**Options:**
1. Use Geneva as primary (already added)
2. Store multiple URLs in Supabase `google_place_id` field (comma-separated or JSON)
3. Create separate entries for each location
4. Update schema to support multiple locations

**Recommendation**: Store all 3 URLs in Supabase `relocators.google_place_id` as a JSON array or comma-separated string, and update the sync function to handle multiple locations.

---

### Companies to Remove/Update

See `DIRECTORY_CORRECTIONS.md` for complete list of 15 companies that need to be removed:
- 3 Moving companies (Harsch, MW Relo, The SMC)
- 3 Merged companies (Schweizer, Connectiv, Touchdown)
- 1 Closed company (Practical Services)
- 4 Wrong category (AP Executive, Altiqa, Gruppo Multi, Leman)
- 4 Freelancers (De Peri, Relocation Geneva, Xpat, Crane)

---

## 📋 Next Steps

1. **Decide on Welcome Service Google URLs approach**
   - Update Supabase schema if needed
   - Or use primary location (Geneva) only

2. **Remove companies from directory**
   - Archive or delete content collection files
   - Update Supabase to hide/remove these companies
   - Test directory page

3. **Update sitemap** to exclude removed companies

---

**Created**: January 2025
**Last Updated**: January 2025


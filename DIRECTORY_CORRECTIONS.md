# Directory Corrections - January 2025

**Status**: ⏳ Pending Implementation

---

## 🗑️ Companies to Remove (Not Relocation Services)

### Moving Companies (Not Relocation Services)
1. **Harsch** - Moving company, doesn't offer relocation services internally
   - File: `harsch.md`
   - Action: Remove from directory or mark as "Moving Company Only"

2. **MW Relo** - Moving company, doesn't offer relocation services internally
   - File: `mw-relo.md`
   - Action: Remove from directory or mark as "Moving Company Only"

3. **The SMC (The Swiss Moving Company)** - Moving company, doesn't offer relocation services internally
   - File: `the-smc.md`
   - Action: Remove from directory or mark as "Moving Company Only"

### Merged/Acquired Companies
4. **Schweizer Relocation** - Now part of Welcome Service
   - File: `schweizer-relocation.md`
   - Action: Remove from directory (merged into Welcome Service)

5. **Connectiv Relocation AG** - Now part of Packimpex
   - File: `connectiv-relocation.md`
   - Action: Remove from directory (merged into Packimpex)

6. **Touchdown Relocation Services** - Now part of Welcome Service
   - File: `touchdown-relocation.md`
   - Action: Remove from directory (merged into Welcome Service)

### Closed Companies
7. **Practical Services** - Closed down few weeks ago
   - File: `practical-services.md`
   - Action: Remove from directory

### Wrong Category (Not Relocation Companies)
8. **AP Executive** - Recruitment firm, not relocation company
   - File: `ap-executive.md`
   - Action: Remove from directory

9. **Altiqa Group** - Consultancy firm, not relocation company
   - File: `altiqa-group.md`
   - Action: Remove from directory

10. **Gruppo Multi** - Consultancy firm, not relocation company
    - File: `gruppo-multi.md`
    - Action: Remove from directory

11. **Leman Relocation** - Real estate firm, not relocation company
    - File: `leman-relocation.md`
    - Action: Remove from directory

### Freelancers (Should be marked differently or removed)
12. **De Peri Relocation Services** - Freelancer
    - File: `de-peri-relocation.md`
    - Action: Mark as "Freelancer" or remove from main directory

13. **Relocation Geneva** - Freelancer
    - File: `relocation-geneva.md`
    - Action: Mark as "Freelancer" or remove from main directory

14. **Xpat Relocation** - Freelancer
    - File: `xpat-relocation.md`
    - Action: Mark as "Freelancer" or remove from main directory

15. **Crane Relocation** - Freelancer
    - File: `crane-relocation.md`
    - Action: Mark as "Freelancer" or remove from main directory

---

## ✅ Companies to Update

### Welcome Service
**File**: `welcome-service.md`

**Updates Required:**
1. ✅ Set `verified: true` (COMPLETED)
2. ⏳ Add Google review URLs for each location:
   - **Geneva**: `https://maps.app.goo.gl/kJLqiTU5qtULd9EDA` ✅ (Added)
   - **Lausanne**: `https://maps.app.goo.gl/VPom11VS84XS9XTV8` ⏳ (Need to add)
   - **Zurich**: `https://maps.app.goo.gl/CrsBwecLgEQAv9Jh9` ⏳ (Need to add)

**Note**: The schema supports `googleMyBusinessUrl` but only one URL. We may need to:
- Store multiple URLs in a JSONB field in Supabase
- Or create separate entries for each location
- Or use a comma-separated list

---

## 📊 Summary

**Total Companies to Remove**: 15
- Moving companies: 3
- Merged/Acquired: 3
- Closed: 1
- Wrong category: 4
- Freelancers: 4

**Total Companies to Update**: 1
- Welcome Service (verified status + Google URLs)

---

## 🔧 Implementation Steps

1. **Remove companies from content collection** (mark files for deletion or move to archive)
2. **Update Supabase database** to remove/hide these companies
3. **Update Welcome Service** with verified status and Google URLs
4. **Test directory page** to ensure removed companies don't appear
5. **Update sitemap** to exclude removed companies

---

## ⚠️ Notes

- Some companies might be in both content collection AND Supabase
- Need to check both locations before removing
- Consider archiving instead of deleting for historical reference
- Freelancers might be kept in a separate "Freelancers" section if desired

---

**Created**: January 2025
**Last Updated**: January 2025



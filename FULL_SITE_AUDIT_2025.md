# 🔍 COMPREHENSIVE SITE AUDIT - SEO, Schema & LLM Optimization

**Date:** January 8, 2025  
**Total Pages Audited:** 48  
**Status:** 🔴 **CRITICAL - Immediate Action Required**

---

## 📊 Executive Summary

### Overall Status
- ✅ **GOOD (0 issues):** 1 page (2%)
- 🟢 **MINOR ISSUES (1):** 11 pages (23%)
- 🟡 **NEEDS WORK (2-3):** 3 pages (6%)
- 🔴 **CRITICAL (4+):** 33 pages (69%)

### Critical Findings
1. **33 pages have NO schema or incomplete schema** - Major SEO impact
2. **Most pages missing canonical URLs** - Duplicate content risk
3. **Most pages missing keywords** - Lost targeting opportunities
4. **Blog pages completely unoptimized** - Zero structured data
5. **Main service pages not found** - Routing issue?

---

## 🚨 CRITICAL PRIORITY (Fix Immediately)

### 1. Core Pages (9 pages) - 7 CRITICAL, 2 NEEDS WORK

#### 🔴 CRITICAL (4 issues each):
- `/about` - ❌ No schema, breadcrumb, canonical, keywords
- `/contact` - ❌ No schema, breadcrumb, canonical, keywords
- `/partners` - ❌ No schema, breadcrumb, canonical, keywords
- `/privacy` - ❌ No schema, breadcrumb, canonical, keywords
- `/terms` - ❌ No schema, breadcrumb, canonical, keywords
- `/cookies` - ❌ No schema, breadcrumb, canonical, keywords
- `/sitemap` - ❌ No schema, breadcrumb, canonical, keywords

#### 🟡 NEEDS WORK (2 issues):
- `/corporate` - ✅ Has schema ⚠️ Missing canonical, keywords
- `/` (Homepage) - ✅ Has Organization schema ⚠️ Missing breadcrumb, canonical

**Action Items:**
- [ ] Add WebPage/AboutPage schema to all core pages
- [ ] Add BreadcrumbList to all pages
- [ ] Add canonical URLs to all pages
- [ ] Add relevant keyword arrays to all pages
- [ ] Add FAQPage schema to About, Contact, Partners
- [ ] Add Organization schema to About page
- [ ] Homepage: Add WebSite schema with search action

---

### 2. Blog Pages (2 pages) - BOTH CRITICAL

#### 🔴 CRITICAL:
- `/blog` - ❌ No schema, breadcrumb, canonical, keywords
- `/blog/[slug]` - ❌ No schema, breadcrumb, canonical, keywords, description, title

**Action Items:**
- [ ] `/blog/[slug]` uses `BlogLayout.astro` - ✅ **Already has schema!**
  - Check if BlogLayout is passing schema properly
  - Audit showed false negative - BlogLayout has Article, BreadcrumbList, FAQPage
- [ ] `/blog/index` - Add ItemList schema for blog listing
- [ ] Add BreadcrumbList to blog index
- [ ] Add canonical URLs
- [ ] Add blog-specific keywords

---

### 3. Region Pages (8 pages) - 6 CRITICAL, 1 NEEDS WORK, 1 MINOR

#### 🔴 CRITICAL (4 issues):
- `/regions/alps` - Has schema but missing: canonical, keywords, description, title
- `/regions/basel` - Has schema but missing: canonical, keywords, description, title
- `/regions/geneva` - Has schema but missing: canonical, keywords, description, title
- `/regions/lausanne` - Has schema but missing: canonical, keywords, description, title
- `/regions/zug` - Has schema but missing: canonical, keywords, description, title
- `/regions/index` - ❌ No schema, breadcrumb, canonical, keywords

#### 🟡 NEEDS WORK (2 issues):
- `/regions/[id]` - ✅ Has Organization schema ⚠️ Missing breadcrumb, canonical

#### 🟢 MINOR (1 issue):
- `/regions/zurich` - ✅ Good schema ⚠️ Missing keywords only

**Action Items:**
- [ ] Fix missing title/description on 5 region pages (alps, basel, geneva, lausanne, zug)
- [ ] Add canonical URLs to all region pages
- [ ] Add location-specific keywords
- [ ] Add Place schema to all region pages
- [ ] Add FAQPage schema to all region pages
- [ ] `/regions/index` - Add ItemList schema
- [ ] `/regions/[id]` - Add BreadcrumbList and Place schema

---

### 4. Company Pages (2 pages) - 1 CRITICAL, 1 NEEDS WORK

#### 🔴 CRITICAL:
- `/companies` (index) - ❌ No schema, breadcrumb, canonical, keywords

#### 🟡 NEEDS WORK:
- `/companies/[id]` - ✅ Has FAQ + Organization ⚠️ Missing breadcrumb, canonical, keywords

**Action Items:**
- [ ] `/companies` - Add ItemList schema for directory
- [ ] `/companies/[id]` - Add LocalBusiness or Service schema
- [ ] Add BreadcrumbList to both pages
- [ ] Add canonical URLs
- [ ] Add Review/AggregateRating schema to company pages
- [ ] Add Place schema with address
- [ ] Add relevant keywords

---

## 🟢 GOOD PERFORMANCE (Keep Monitoring)

### Service + Location Pages (12 pages) - 11 MINOR, 1 PERFECT

#### ✅ PERFECT (0 issues):
- `/services/housing/zurich` - 🎉 **Reference implementation!**

#### 🟢 MINOR (1 issue - missing keywords):
- `/services/advisory/alps`
- `/services/advisory/zug`
- `/services/finance/geneva`
- `/services/finance/zug`
- `/services/finance/zurich`
- `/services/housing/basel`
- `/services/housing/geneva`
- `/services/housing/lausanne`
- `/services/housing/zug`
- `/services/immigration/geneva`
- `/services/immigration/zurich`

**Action Items:**
- [ ] Add keywords array to all 11 service+location pages
- [ ] Model after `/services/housing/zurich` implementation

---

## ⚠️ MISSING PAGES

### Main Service Pages NOT FOUND
The audit couldn't find these main service pages:
- `/services/housing`
- `/services/immigration` (or `/services/visa`)
- `/services/banking-finance`
- `/services/education`
- `/services/advisory`
- `/services/settling-in`
- `/services/departure`
- `/services/insurance`
- `/services/moving-logistics`
- `/services/corporate-relocation`
- `/services/finance`

**Investigation Needed:**
- [ ] Check if these pages exist
- [ ] Check if they're being filtered incorrectly
- [ ] If they exist, audit each for schema/SEO
- [ ] If missing, create them with full schema

---

## 📋 SCHEMA TYPES NEEDED BY PAGE TYPE

### Homepage (`/`)
- ✅ Organization (HAS)
- [ ] WebSite with searchAction
- [ ] BreadcrumbList
- [ ] ItemList (featured companies)

### About Page (`/about`)
- [ ] Organization
- [ ] AboutPage
- [ ] BreadcrumbList
- [ ] Person schemas for team members (if applicable)

### Contact Page (`/contact`)
- [ ] ContactPage
- [ ] Organization with contactPoint
- [ ] BreadcrumbList
- [ ] FAQPage

### Partners Page (`/partners`)
- [ ] Service or Offer
- [ ] BreadcrumbList
- [ ] FAQPage
- [ ] HowTo (how to become partner)

### Corporate Page (`/corporate`)
- ✅ Service, Organization, FAQ, Breadcrumb (HAS)
- [ ] Add keywords and canonical

### Blog Index (`/blog`)
- [ ] ItemList or Blog
- [ ] BreadcrumbList
- [ ] CollectionPage

### Blog Posts (`/blog/[slug]`)
- ✅ Article, BreadcrumbList, FAQPage (HAS via BlogLayout)
- [ ] Verify implementation is working

### Region Pages (`/regions/*`)
- ✅ Most have Service, Organization, Breadcrumb (HAVE)
- [ ] Add Place schema with coordinates
- [ ] Add FAQPage
- [ ] Add ItemList (companies in region)
- [ ] Fix missing titles/descriptions

### Service Pages (`/services/*`)
- ✅ Most have Service, Organization, Breadcrumb, FAQ (HAVE)
- [ ] Add keywords to all
- [ ] Ensure canonical URLs

### Company Pages (`/companies/[id]`)
- ✅ Has Organization, FAQ (HAS)
- [ ] Add LocalBusiness or ProfessionalService
- [ ] Add AggregateRating
- [ ] Add Review schemas
- [ ] Add Place with address
- [ ] Add BreadcrumbList

### Company Directory (`/companies`)
- [ ] ItemList
- [ ] CollectionPage
- [ ] BreadcrumbList

---

## 🎯 PRIORITY ACTION PLAN

### Phase 1: Critical Fixes (Week 1)
**Goal:** Fix all CRITICAL pages (33 pages)

1. **Core Pages (7 pages)** - 2-3 hours
   - Add complete schema package to: about, contact, partners, privacy, terms, cookies, sitemap
   - Template: BreadcrumbList + WebPage + Organization + FAQPage

2. **Homepage (1 page)** - 1 hour
   - Add WebSite schema with search action
   - Add BreadcrumbList
   - Add ItemList for featured companies

3. **Blog Index (1 page)** - 1 hour
   - Add ItemList schema
   - Add BreadcrumbList

4. **Region Pages (6 pages)** - 3 hours
   - Fix missing titles/descriptions on alps, basel, geneva, lausanne, zug
   - Add canonical URLs
   - Add keywords
   - Add Place schema
   - Add FAQPage

5. **Company Directory (1 page)** - 1 hour
   - Add ItemList schema
   - Add BreadcrumbList

**Total Phase 1:** 8-9 hours

---

### Phase 2: Needs Work (Week 2)
**Goal:** Fix NEEDS WORK pages (3 pages)

1. **Corporate Page** - 30 minutes
   - Add canonical URL
   - Add keywords

2. **Dynamic Region Page** - 1 hour
   - Add BreadcrumbList
   - Add canonical URL
   - Add Place schema

3. **Company Profile Pages** - 1.5 hours
   - Add LocalBusiness schema
   - Add AggregateRating
   - Add BreadcrumbList
   - Add canonical URL
   - Add keywords

**Total Phase 2:** 3 hours

---

### Phase 3: Minor Issues (Week 2-3)
**Goal:** Add keywords to 11 service+location pages

1. **Service+Location Pages (11 pages)** - 2 hours
   - Add keywords array to each page
   - Model after housing/zurich

**Total Phase 3:** 2 hours

---

### Phase 4: Missing Pages Investigation (Week 3)
**Goal:** Find and optimize main service pages

1. **Audit Main Service Pages** - 2 hours
   - Locate all main service pages
   - Check current schema status
   - Add missing schema

2. **Create Missing Pages** - variable
   - If pages don't exist, create with full schema

**Total Phase 4:** 2-4 hours

---

## 📈 EXPECTED RESULTS

### After Phase 1 (Week 1):
- ✅ 100% of core pages optimized
- ✅ 0 CRITICAL pages remaining
- ✅ Google can display rich results for all key pages
- ✅ FAQ snippets eligible across site
- ✅ Breadcrumb trails in search results
- ✅ Organization knowledge panel
- ✅ Better LLM understanding and citations

### After Phase 2 (Week 2):
- ✅ All static pages fully optimized
- ✅ Company profiles with ratings visible
- ✅ LocalBusiness results in Google Maps
- ✅ Regional SEO improved

### After Phase 3 (Week 2-3):
- ✅ 100% of service+location pages optimized
- ✅ Complete keyword targeting
- ✅ Maximum search visibility

### After Phase 4 (Week 3):
- ✅ All pages on site fully optimized
- ✅ Complete structured data coverage
- ✅ Maximum SEO potential achieved

---

## 🛠️ IMPLEMENTATION TEMPLATES

### Template 1: Core Page (About, Contact, Partners)

```astro
---
const title = "Page Title | ReloFinder";
const description = "Page description...";
const canonical = "https://relofinder.ch/page-slug";
const keywords = ["keyword1", "keyword2", "keyword3"];

const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://relofinder.ch" },
        { "@type": "ListItem", "position": 2, "name": "Page Name", "item": canonical }
      ]
    },
    {
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": canonical
    },
    {
      "@type": "Organization",
      "name": "ReloFinder",
      "url": "https://relofinder.ch"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Question text?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Answer text..."
          }
        }
      ]
    }
  ]
};
---

<Layout 
  title={title}
  description={description}
  canonical={canonical}
  keywords={keywords}
  schema={combinedSchema}
>
  <!-- Page content -->
</Layout>
```

### Template 2: Blog Index

```astro
---
const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://relofinder.ch" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://relofinder.ch/blog" }
      ]
    },
    {
      "@type": "CollectionPage",
      "name": "ReloFinder Blog",
      "description": "Swiss relocation guides and tips",
      "url": "https://relofinder.ch/blog"
    },
    {
      "@type": "ItemList",
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": post.data.title,
          "url": `https://relofinder.ch/blog/${post.slug}`
        }
      }))
    }
  ]
};
---
```

### Template 3: Company Directory

```astro
---
const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://relofinder.ch" },
        { "@type": "ListItem", "position": 2, "name": "Companies", "item": "https://relofinder.ch/companies" }
      ]
    },
    {
      "@type": "CollectionPage",
      "name": "Swiss Relocation Companies",
      "description": "Compare Swiss relocation agencies",
      "url": "https://relofinder.ch/companies"
    },
    {
      "@type": "ItemList",
      "itemListElement": companies.map((company, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Organization",
          "name": company.name,
          "url": `https://relofinder.ch/companies/${company.slug}`
        }
      }))
    }
  ]
};
---
```

---

## 📊 TRACKING PROGRESS

### Week 1 Checklist
- [ ] about.astro - Add full schema
- [ ] contact.astro - Add full schema
- [ ] partners.astro - Add full schema
- [ ] privacy.astro - Add full schema
- [ ] terms.astro - Add full schema
- [ ] cookies.astro - Add full schema
- [ ] sitemap.astro - Add full schema
- [ ] index.astro - Add WebSite + BreadcrumbList
- [ ] blog/index.astro - Add ItemList schema
- [ ] regions/alps.astro - Fix title/description
- [ ] regions/basel.astro - Fix title/description
- [ ] regions/geneva.astro - Fix title/description
- [ ] regions/lausanne.astro - Fix title/description
- [ ] regions/zug.astro - Fix title/description
- [ ] regions/index.astro - Add full schema
- [ ] companies/index.astro - Add ItemList schema

### Week 2 Checklist
- [ ] corporate.astro - Add canonical + keywords
- [ ] regions/[id].astro - Add BreadcrumbList + Place
- [ ] companies/[id].astro - Add LocalBusiness + Rating
- [ ] All 11 service+location pages - Add keywords

### Week 3 Checklist
- [ ] Audit main service pages
- [ ] Add schema to main service pages
- [ ] Final site-wide verification
- [ ] Submit updated sitemap to Google

---

## 🎯 SUCCESS METRICS

### Before (Current State):
- ✅ GOOD: 2%
- 🟢 MINOR: 23%
- 🟡 NEEDS WORK: 6%
- 🔴 CRITICAL: 69%

### After Phase 1 (Target):
- ✅ GOOD: 30%
- 🟢 MINOR: 40%
- 🟡 NEEDS WORK: 20%
- 🔴 CRITICAL: 10%

### After All Phases (Target):
- ✅ GOOD: 90%+
- 🟢 MINOR: 10%
- 🟡 NEEDS WORK: 0%
- 🔴 CRITICAL: 0%

---

## 📝 NOTES

1. **BlogLayout.astro** already has excellent schema - audit showed false negative
2. **housing/zurich** is the gold standard - copy its implementation
3. Some main service pages may be missing - needs investigation
4. React hooks error is separate issue - doesn't affect SEO
5. Priority is fixing CRITICAL pages first (immediate SEO impact)
6. All changes should be tested with [Google Rich Results Test](https://search.google.com/test/rich-results)

---

**Last Updated:** January 8, 2025  
**Next Review:** After Phase 1 completion (Week 1)


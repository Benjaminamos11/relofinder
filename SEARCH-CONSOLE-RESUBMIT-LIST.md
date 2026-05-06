# URLs to Re-Submit in Google Search Console

After this branch deploys, request indexing for each URL below in **Google Search Console → URL Inspection → Request Indexing**.

Group 1 = title/meta rewrites (Fix 1).
Group 2 = trailing-slash canonical change (Fix 2).
Group 3 = 2025 → 2026 refreshes (Fix 3).

---

## Fix 1 — Brand-name company profiles (title + meta rewrite)

- [ ] https://relofinder.ch/companies/welcome-service/
- [ ] https://relofinder.ch/companies/lodge-relocation/
- [ ] https://relofinder.ch/companies/prime-relocation/
- [ ] https://relofinder.ch/companies/swiss-expat-realtor/
- [ ] https://relofinder.ch/companies/relonest/
- [ ] https://relofinder.ch/companies/executive-relocation/
- [ ] https://relofinder.ch/companies/silver-nest-relocation/
- [ ] https://relofinder.ch/companies/matterhorn-relocation/
- [ ] https://relofinder.ch/companies/la-boutique-relocation/
- [ ] https://relofinder.ch/companies/anchor-relocation/
- [ ] https://relofinder.ch/companies/connectiv-relocation-ag/
- [ ] https://relofinder.ch/companies/ap-executive/

## Fix 2 — Pages affected by trailing-slash canonicalization

The `_redirects` rules now 301 every no-slash URL to its `/` version. Resubmit the canonical (with-slash) form for the duplicate-indexed pairs Search Console flagged:

- [ ] https://relofinder.ch/blog/cost-of-living-switzerland-breakdown-2026/
- [ ] https://relofinder.ch/companies/prime-relocation/
- [ ] https://relofinder.ch/companies/
- [ ] https://relofinder.ch/regions/zurich/
- [ ] https://relofinder.ch/regions/zug/
- [ ] https://relofinder.ch/regions/basel/
- [ ] https://relofinder.ch/regions/geneva/

## Fix 3 — Renamed 2025 → 2026 posts

- [ ] https://relofinder.ch/blog/best-relocation-companies-switzerland-2026/
- [ ] https://relofinder.ch/blog/best-health-insurance-consultants-switzerland-2026/

### Old URLs to mark as removed / 301'd

These return 301 → 2026 versions via `_redirects`. No action needed unless GSC still serves the old URL after a week:

- https://relofinder.ch/blog/best-relocation-companies-switzerland-2025/
- https://relofinder.ch/blog/best-health-insurance-consultants-switzerland-2025/

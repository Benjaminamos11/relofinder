# Google Reviews Integration - Setup Guide

## ✅ SerpAPI Key Configured

Your SerpAPI key has been saved and is ready to use:
```
9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

## 🎯 Purpose

This integration allows you to:
1. Fetch Google Maps reviews for agencies
2. Store external review snapshots in your database
3. Calculate weighted ratings (60% internal + 40% external)
4. Display Google ratings alongside platform reviews

## 📝 Environment Setup

Create a `.env` file in your project root:

```env
# Supabase (required)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# SerpAPI for Google Reviews (configured)
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

## 🔧 How to Use

### 1. Find Google Place ID

For each agency, you need their Google Maps Place ID:

**Method A: Using Google Place ID Finder**
- Visit: https://developers.google.com/maps/documentation/places/web-service/place-id
- Search for the agency name + location
- Copy the Place ID (format: `ChIJ...`)

**Method B: From Google Maps URL**
```
Example URL: https://www.google.com/maps/place/Prime+Relocation/@47.3769,8.5417,15z/data=!4m5!3m4!1s0x0:0x...!8m2!3d47.3769!4d8.5417

Look for "1s0x0:0x..." in the URL
```

**Known Place IDs** (from your project context):
- Prime Relocation: `ChIJa76xwh5jjkcRW8H3M4Kt0Os`

### 2. Sync Reviews via API

**Option A: Using curl**

```bash
curl -X POST http://localhost:4321/api/sync-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "agency_id": "uuid-from-database",
    "place_id": "ChIJa76xwh5jjkcRW8H3M4Kt0Os"
  }'
```

**Option B: Using the helper script**

Create `scripts/sync-reviews.js`:

```javascript
// scripts/sync-reviews.js
const agencies = [
  {
    name: 'Prime Relocation',
    slug: 'prime-relocation',
    place_id: 'ChIJa76xwh5jjkcRW8H3M4Kt0Os'
  },
  // Add more agencies here
];

async function syncAll() {
  for (const agency of agencies) {
    console.log(`Syncing reviews for ${agency.name}...`);
    
    const response = await fetch('http://localhost:4321/api/sync-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_id: agency.slug, // or UUID if you have it
        place_id: agency.place_id
      })
    });
    
    const result = await response.json();
    console.log(result);
  }
}

syncAll();
```

Run with:
```bash
node scripts/sync-reviews.js
```

### 3. Verify in Database

Check the synced data:

```sql
-- View all external reviews
SELECT 
  a.name,
  er.source,
  er.rating,
  er.review_count,
  er.captured_at
FROM external_reviews er
JOIN agencies a ON a.id = er.agency_id
ORDER BY er.captured_at DESC;

-- Check weighted ratings
SELECT 
  a.name,
  COUNT(r.id) as internal_reviews,
  ROUND(AVG(r.rating)::numeric, 2) as internal_avg,
  er.review_count as external_reviews,
  er.rating as external_avg
FROM agencies a
LEFT JOIN reviews r ON r.agency_id = a.id AND r.is_published = true
LEFT JOIN external_reviews er ON er.agency_id = a.id AND er.source = 'google'
GROUP BY a.name, er.review_count, er.rating;
```

## 🔄 Automated Syncing

### Option A: Cron Job (Server)

Create a cron job to sync reviews daily:

```bash
# Add to crontab (crontab -e)
0 2 * * * curl -X POST http://localhost:4321/api/sync-reviews -H "Content-Type: application/json" -d '{"agency_id":"uuid","place_id":"ChIJ..."}'
```

### Option B: GitHub Actions (Recommended)

Create `.github/workflows/sync-reviews.yml`:

```yaml
name: Sync Google Reviews

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Sync Reviews
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/sync-reviews \
            -H "Content-Type: application/json" \
            -d '{"agency_id":"${{ secrets.AGENCY_ID }}","place_id":"${{ secrets.PLACE_ID }}"}'
```

### Option C: Vercel Cron (If deployed on Vercel)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/sync-reviews",
    "schedule": "0 2 * * *"
  }]
}
```

## 📊 SerpAPI Response Example

```json
{
  "place_results": {
    "title": "Prime Relocation",
    "rating": 4.8,
    "reviews": 53,
    "reviews_results": [
      {
        "user": {
          "name": "John Doe"
        },
        "rating": 5,
        "date": "2 weeks ago",
        "snippet": "Excellent service, very professional..."
      }
    ]
  }
}
```

## 🎯 Rating Calculation

Once external reviews are synced, the weighted rating automatically calculates:

```
Overall = (Internal × 0.6) + (External × 0.4)

Example:
- Internal: 5 reviews, 4.8★ avg → 4.8 × 0.6 = 2.88
- External: 53 Google reviews, 4.8★ → 4.8 × 0.4 = 1.92
- Overall: 2.88 + 1.92 = 4.8★
```

This displays automatically on the agency profile page.

## 🔍 Debugging

### Check API Key
```bash
# Test SerpAPI directly
curl "https://serpapi.com/search.json?engine=google_maps&place_id=ChIJa76xwh5jjkcRW8H3M4Kt0Os&api_key=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77"
```

### Common Issues

**401 Unauthorized**
- Check API key is correct in `.env`
- Verify SerpAPI account is active

**No reviews found**
- Verify Place ID is correct
- Check if business has Google reviews
- Try searching manually on Google Maps

**Rate Limiting**
- Free tier: 100 searches/month
- Paid tier: Higher limits
- Check your SerpAPI dashboard for usage

## 📈 SerpAPI Pricing

- **Free**: 100 searches/month
- **Developer**: $50/month for 5,000 searches
- **Production**: $125/month for 15,000 searches

**Recommendation**: 
- Start with free tier for testing
- Upgrade if syncing >100 agencies/month

## 🎯 Best Practices

1. **Cache Results**: External reviews don't change often, sync daily not real-time
2. **Store Snapshots**: Keep historical data to track rating trends
3. **Fallback Gracefully**: If API fails, show only internal reviews
4. **Monitor Usage**: Track API calls to avoid overage charges
5. **Validate Data**: Check for null values before inserting to DB

## 📝 Adding More Agencies

1. Find their Google Place ID
2. Add to database with Place ID in metadata
3. Run sync command
4. Verify weighted rating appears on profile

Example migration:

```sql
-- Add Place ID column to agencies table
ALTER TABLE agencies ADD COLUMN google_place_id TEXT;

-- Update existing agencies
UPDATE agencies 
SET google_place_id = 'ChIJa76xwh5jjkcRW8H3M4Kt0Os'
WHERE slug = 'prime-relocation';

-- Sync via API or script
```

## ✅ Checklist

- [x] SerpAPI key configured
- [x] Environment variable set
- [x] Helper functions created (`src/lib/serpapi.ts`)
- [x] Sync API route created (`/api/sync-reviews`)
- [x] Database ready for external reviews
- [ ] Find Place IDs for all agencies
- [ ] Run initial sync
- [ ] Set up automated daily sync
- [ ] Monitor API usage

## 🚀 Quick Test

```bash
# 1. Set environment variable
export SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77

# 2. Start dev server
npm run dev

# 3. Sync Prime Relocation (replace UUID)
curl -X POST http://localhost:4321/api/sync-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "agency_id": "get-uuid-from-database",
    "place_id": "ChIJa76xwh5jjkcRW8H3M4Kt0Os"
  }'

# 4. Check profile page
open http://localhost:4321/companies/prime-relocation
```

You should see the Google review count and weighted rating!

---

**Status**: ✅ Configured and ready to use  
**API Key**: Active  
**Integration**: Complete  
**Next Step**: Find Place IDs for remaining agencies

# Fix 404 Error on /companies/prime-relocation

## Problem
Getting 404 because the database hasn't been migrated yet.

## Solution (3 Options)

### Option 1: Run Supabase Migrations (Recommended)

```bash
# 1. Install Supabase CLI if not installed
npm install -g supabase

# 2. Link your project
supabase link --project-ref your-project-ref

# 3. Run migrations
supabase db push
```

### Option 2: Manual SQL Execution

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy & paste `supabase/migrations/001_agency_profiles_system.sql`
3. Click **Run**
4. Copy & paste `supabase/migrations/002_seed_sample_agencies.sql`
5. Click **Run**

### Option 3: Quick Test Without Database

If you want to test the page immediately without setting up Supabase, create a mock data version:

```bash
# Create test page
cat > src/pages/companies/prime-relocation.astro << 'EOF'
---
// Mock data for testing without database
const mockAgency = {
  id: 'test-id',
  slug: 'prime-relocation',
  name: 'Prime Relocation',
  tagline: 'Verified Swiss Relocation Agency since 2008',
  year_founded: 2008,
  languages: ['en', 'de', 'fr', 'it'],
  website_url: 'https://www.prime-relocation.ch',
  phone: '+41 44 123 4567',
  email: 'contact@prime-relocation.ch',
  meeting_url: 'https://calendly.com/prime-relocation',
  status: 'preferred',
};

const mockServices = [
  { id: 1, code: 'housing', label: 'Housing & Real Estate' },
  { id: 2, code: 'immigration', label: 'Visa & Immigration' },
  { id: 3, code: 'finance', label: 'Banking & Finance' },
];

const mockRegions = [
  { id: 1, code: 'zurich', label: 'Zürich' },
  { id: 2, code: 'geneva', label: 'Geneva' },
];

const mockRating = {
  overall: 4.8,
  internal_avg: 4.8,
  internal_count: 5,
  external_avg: 4.8,
  external_count: 53,
};

const mockReviews = [];
const alternatives = [];

import AgencyStatusBadge from '../../components/agencies/AgencyStatusBadge';
import ReviewStars from '../../components/agencies/ReviewStars';
import ContactPanel from '../../components/agencies/ContactPanel';
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prime Relocation - Profile & Reviews | ReloFinder</title>
</head>
<body class="bg-gray-50">
  <main class="max-w-7xl mx-auto px-4 py-12">
    <div class="bg-white rounded-3xl p-12 shadow-sm border border-gray-200">
      <div class="flex items-center gap-4 mb-4">
        <h1 class="text-5xl font-bold text-gray-900">
          {mockAgency.name}
        </h1>
        <AgencyStatusBadge status={mockAgency.status} client:load />
      </div>
      
      <p class="text-xl text-gray-600 mb-6">{mockAgency.tagline}</p>
      
      <div class="mb-6">
        <ReviewStars rating={mockRating.overall} size="lg" client:load />
      </div>

      <div class="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p class="text-yellow-800 font-medium">
          ⚠️ <strong>Test Mode:</strong> This is displaying mock data. 
          To see real data, set up your Supabase database by running the migrations.
        </p>
        <a href="https://github.com/supabase/supabase" class="text-yellow-600 underline">
          View Setup Instructions
        </a>
      </div>
    </div>
  </main>
</body>
</html>
EOF
```

## Environment Setup Required

Create `.env` file in project root:

```env
# Get these from Supabase Dashboard → Settings → API
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# SerpAPI (already configured)
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

## Verify Setup

After running migrations, verify data exists:

```bash
# Using Supabase CLI
supabase db dump --data-only -t agencies

# Or check in Supabase Dashboard → Table Editor → agencies
```

You should see 4 agencies:
- prime-relocation (Preferred)
- auris-relocation (Partner)
- lodge-brothers (Standard)
- lifestyle-managers (Preferred)

## Restart Dev Server

After setting up the database:

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev

# Visit
open http://localhost:4321/companies/prime-relocation
```

## Still Getting 404?

### Check 1: Route File Exists
```bash
ls -la src/pages/companies/[slug].astro
```
Should exist ✅

### Check 2: Supabase Connection
Test in browser console on any page:
```javascript
fetch('/api/agency/prime-relocation')
  .then(r => r.json())
  .then(console.log)
```

Should return agency data, not 404.

### Check 3: Database Has Data
In Supabase Dashboard SQL Editor:
```sql
SELECT slug, name, status FROM agencies WHERE slug = 'prime-relocation';
```

Should return 1 row.

## Need Supabase Credentials?

If you don't have a Supabase project yet:

1. Go to https://supabase.com
2. Sign up (free tier is fine)
3. Create new project
4. Wait 2-3 minutes for provisioning
5. Go to Settings → API
6. Copy URL and anon key to `.env`
7. Run migrations

## Alternative: Use Existing Content System

If you want to test the UI without Supabase, you can temporarily modify the route to use static data. See the mock data example in Option 3 above.


# Agency Profiles System - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# SerpAPI for Google Reviews (already configured)
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

Get these from: 
- Supabase: Dashboard → Project Settings → API
- SerpAPI: Already provided ✅

### Step 3: Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# If you haven't linked your project yet
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Option B: Manual SQL Execution**

1. Go to Supabase Dashboard → SQL Editor
2. Copy & paste content from `supabase/migrations/001_agency_profiles_system.sql`
3. Click "Run"
4. Repeat for `supabase/migrations/002_seed_sample_agencies.sql`

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: View Sample Profile

Open your browser to:
```
http://localhost:4321/companies/prime-relocation
```

## ✅ What You Should See

- **Hero Section**: Prime Relocation with "Preferred" badge, 4.8★ rating
- **Contact Panel**: Direct contact form + "Schedule a Meeting" button
- **AI Review Summary**: Strengths and areas for improvement
- **User Reviews**: 5 sample reviews with 1 agency reply
- **Alternatives**: 3 other agencies (Auris, Lodge Brothers, Lifestyle Managers)
- **FAQ**: 6 expandable questions
- **SEO**: JSON-LD structured data in page source

## 🎯 Test the Features

### 1. Submit a Review

1. Click "Write a Review" button
2. Select rating (1-5 stars)
3. Choose service type
4. Write review details
5. Enter email address
6. Submit

**Expected**: Review appears in list (refresh page)

### 2. Submit a Lead

1. Fill out contact form in right sidebar
2. Enter name, email, optional phone/message
3. Click "Contact Agency"

**Expected**: Success message, lead saved to database

### 3. Check Different Tiers

Visit these URLs to see tier differences:

- **Preferred**: `/companies/prime-relocation` (full features)
- **Partner**: `/companies/auris-relocation` (contact form, no meeting link)
- **Standard**: `/companies/lodge-brothers` (no contact form, "Compare" CTA)

### 4. Verify API Routes

```bash
# Test leads endpoint
curl -X POST http://localhost:4321/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "agency_id": "uuid-from-database",
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test inquiry"
  }'

# Test agency data endpoint
curl http://localhost:4321/api/agency/prime-relocation
```

## 📊 Database Overview

### Check Your Data

Run these queries in Supabase SQL Editor:

```sql
-- View all agencies
SELECT slug, name, status FROM agencies;

-- View reviews with ratings
SELECT 
  a.name,
  r.rating,
  r.title,
  r.created_at
FROM reviews r
JOIN agencies a ON a.id = r.agency_id
ORDER BY r.created_at DESC;

-- View weighted ratings
SELECT 
  a.name,
  COUNT(r.id) as review_count,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM agencies a
LEFT JOIN reviews r ON r.agency_id = a.id
GROUP BY a.name;

-- View leads
SELECT 
  a.name as agency,
  l.name as lead_name,
  l.email,
  l.sent_to_agency,
  l.created_at
FROM leads l
JOIN agencies a ON a.id = l.agency_id
ORDER BY l.created_at DESC;
```

## 🔧 Configuration

### Customize Tier Rules

Edit: `src/components/agencies/ContactPanel.tsx`

```typescript
// Change behavior for standard tier
if (agency.status === 'standard') {
  // Customize redirect or messaging
}
```

### Adjust Rating Weights

Edit: `src/lib/ratings.ts`

```typescript
const INTERNAL_WEIGHT = 0.6;  // Change to 0.7 for 70% internal
const EXTERNAL_WEIGHT = 0.4;  // Change to 0.3 for 30% external
```

### Add Agency Admin Emails

Edit: `src/pages/api/replies.ts`

```typescript
const AGENCY_ADMIN_EMAILS = [
  'admin@prime-relocation.ch',
  'admin@aurisag.com',
  'your-admin@agency.com',  // Add yours
];
```

## 🎨 Styling Customization

### Brand Colors

All components use Tailwind classes. Main colors:

- **Primary CTA**: `bg-gradient-to-r from-red-600 to-red-500`
- **Preferred Badge**: `bg-gradient-to-r from-red-50 to-orange-50`
- **Partner Badge**: `bg-blue-50 text-blue-700`
- **Standard Badge**: `bg-gray-100 text-gray-700`

### Component Styling

Each component in `src/components/agencies/` can be styled independently with Tailwind classes.

## 🐛 Troubleshooting

### Issue: "Supabase env vars not configured"

**Fix**: Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to `.env`

### Issue: Components not rendering

**Fix**: Ensure components have `client:load` directive in Astro page

```astro
<ContactPanel agency={agency} client:load />
```

### Issue: 404 on `/companies/prime-relocation`

**Fix**: 
1. Check migrations ran successfully
2. Verify `slug` column in agencies table has `'prime-relocation'`
3. Restart dev server

### Issue: Reviews not showing

**Fix**:
```sql
-- Check published status
SELECT * FROM reviews WHERE is_published = true;

-- Publish all reviews
UPDATE reviews SET is_published = true;
```

### Issue: Rating showing 0.0

**Fix**: 
- Add reviews with ratings 1-5
- Add external_reviews snapshot
- Rating calculates as: 60% internal + 40% external

### Issue: Leads not saving

**Fix**:
1. Check RLS policy: `CREATE POLICY "public_create_leads" ON leads FOR INSERT WITH CHECK (true);`
2. Verify Supabase anon key has insert permission
3. Check browser console for errors

## 📚 Additional Resources

- **Full Documentation**: `README_AGENCY_PROFILES.md`
- **Database Schema**: `supabase/migrations/001_agency_profiles_system.sql`
- **Sample Data**: `supabase/migrations/002_seed_sample_agencies.sql`
- **Type Definitions**: `src/lib/types/agencies.ts`

## 🚢 Next Steps

1. **Email Integration**: Connect SendGrid/Mailgun for lead forwarding
2. **Agency Dashboard**: Build admin UI for managing profiles
3. **Photo Uploads**: Add Supabase Storage for agency logos
4. **Review Moderation**: Create internal moderation UI
5. **Analytics**: Track views, leads, conversions per agency

## ✨ Success Criteria

You've successfully set up the system if:

- ✅ Prime Relocation profile loads at `/companies/prime-relocation`
- ✅ You can submit a review through the multi-step form
- ✅ Contact form submits and saves to database
- ✅ Rating displays correctly (4.8★ for Prime)
- ✅ Alternatives show 3 other agencies
- ✅ FAQ accordion expands/collapses
- ✅ JSON-LD appears in page source (view source, search for "application/ld+json")
- ✅ No console errors in browser
- ✅ All components render with proper styling

## 🆘 Need Help?

1. Check browser console for errors
2. Review Supabase logs in dashboard
3. Verify database has data: `SELECT COUNT(*) FROM agencies;`
4. Test API routes with curl/Postman
5. Check this guide and full README

---

**Status**: ✅ All 8 tasks completed
**Version**: 1.0
**Last Updated**: October 3, 2025


# Agency Profiles System - Implementation Guide

## Overview
Complete agency profiles system for ReloFinder with review management, weighted ratings, tier logic, and lead capture.

## Features Implemented

### 1. Database Schema (Supabase)
- **Tables**: agencies, services, regions, reviews, review_replies, external_reviews, review_summaries, leads
- **RLS Policies**: Public read, authenticated write for reviews, protected leads
- **Indexes**: Optimized for common queries
- **Migrations**: Located in `supabase/migrations/`

### 2. Rating System
- **Weighted Formula**: 60% internal reviews + 40% external reviews
- **Sources**: Internal platform reviews + Google/LinkedIn snapshots
- **Display**: Star rating with breakdown by source

### 3. Tier Logic

#### Standard
- Basic listing
- No direct contact form
- CTA: "Compare Providers"
- Users can leave reviews
- No agency reply capability

#### Partner
- Full contact details
- Direct contact form
- Leads forwarded to agency email
- Can reply to reviews
- Appears in directory listings

#### Preferred
- All Partner features
- "Schedule Meeting" CTA with Cal.com/Calendly integration
- Priority placement in listings
- Enhanced profile display

### 4. Components (React)

Location: `src/components/agencies/`

- **AgencyStatusBadge.tsx**: Tier badge with distinct styling
- **ReviewStars.tsx**: 5-star display with half-star support
- **ContactPanel.tsx**: Conditional contact form by tier
- **ReviewForm.tsx**: Multi-step review submission
- **ReviewsList.tsx**: Display reviews with replies
- **ReviewSummaryCard.tsx**: AI-generated summary
- **AlternativesList.tsx**: Show 3 similar agencies
- **FaqAccordion.tsx**: Expandable FAQ section

### 5. API Routes (Astro)

Location: `src/pages/api/`

- **POST /api/leads**: Create lead, forward to partner/preferred agencies
- **POST /api/reviews**: Submit review (with email verification)
- **POST /api/replies**: Agency reply (partner/preferred only)
- **GET /api/agency/[slug]**: Fetch complete profile data

### 6. SEO (JSON-LD)

Location: `src/lib/schema.ts`

- Organization schema
- AggregateRating schema
- FAQPage schema
- ItemList schema (alternatives)

### 7. Sample Profile

**URL**: `/companies/prime-relocation`

**Sections**:
1. Hero with rating, status badge, services, regions
2. AI review summary
3. Pros & Cons
4. User reviews with submission form
5. Alternatives (3 agencies)
6. FAQ (6 questions)
7. Disclaimer

## Setup Instructions

### 1. Environment Variables

Create `.env` file:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually run SQL files in order:
# 1. supabase/migrations/001_agency_profiles_system.sql
# 2. supabase/migrations/002_seed_sample_agencies.sql
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 4. Start Dev Server

```bash
npm run dev
```

### 5. Visit Sample Profile

Navigate to: `http://localhost:4321/companies/prime-relocation`

## Database Seeded Data

### Agencies

1. **Prime Relocation** (Preferred)
   - Slug: `prime-relocation`
   - Services: All
   - Regions: Zurich, Geneva, Basel, Zug
   - 5 sample reviews (4.8/5 average)
   - External Google reviews: 4.8/5 (53 reviews)

2. **Auris Relocation** (Partner)
   - Slug: `auris-relocation`
   - Services: Housing, Immigration, Settling-In
   - Regions: Zurich, Basel

3. **Lodge Brothers** (Standard)
   - Slug: `lodge-brothers`
   - Services: Housing, Settling-In
   - Regions: Geneva

4. **Lifestyle Managers** (Preferred)
   - Slug: `lifestyle-managers`
   - Services: All
   - Regions: Zurich, Geneva, Zug

### Services

- Housing & Real Estate
- Visa & Immigration
- Banking & Finance
- Advisory (HNWI/Corporate)
- Education & Schools
- Settling-In

### Regions

- Zürich
- Geneva
- Basel
- Zug
- Lausanne
- Alpine Regions

## Tier Upgrade Flow

### From Standard to Partner

**Requirements**:
1. Verify business details
2. Sign partnership agreement
3. Provide valid email for lead forwarding
4. Pay partner fee (if applicable)

**Benefits Gained**:
- Direct contact form
- Lead forwarding
- Reply to reviews
- Enhanced visibility

### From Partner to Preferred

**Requirements**:
1. Maintain 4.0+ rating
2. Respond to reviews within 48 hours
3. Provide meeting scheduling link
4. Pay preferred fee (if applicable)

**Benefits Gained**:
- "Schedule Meeting" CTA
- Priority placement
- Featured on homepage/category pages
- Premium badge styling

## Lead Flow

### Standard Tier
- No direct leads
- Users redirected to comparison tool

### Partner Tier
1. User submits contact form
2. Lead saved to `leads` table
3. Email sent to agency (TODO: implement email service)
4. `sent_to_agency` flag set to `true`

### Preferred Tier
- Same as Partner
- PLUS: Direct meeting scheduling via Cal.com/Calendly

## Review Moderation

### Auto-Approval
- Authenticated users: `is_verified = true`
- Email-verified users: `is_verified = false` (manual review)

### Manual Moderation
Query pending reviews:

```sql
SELECT * FROM reviews WHERE is_verified = false AND is_published = true;
```

### Agency Replies
- Only Partner/Preferred can reply
- Requires authentication
- Admin email allowlist in `src/pages/api/replies.ts`

**TODO**: Implement `agency_admins` table for better access control

## Next Steps

### Phase 1: Core Features
- [x] Database schema
- [x] Rating calculation
- [x] UI components
- [x] API routes
- [x] Sample profile page
- [x] Seed data

### Phase 2: Enhancements
- [ ] Email notifications (SendGrid/Mailgun)
- [ ] Webhook integrations for lead forwarding
- [ ] Email OTP verification for reviews
- [ ] Agency admin dashboard
- [ ] Review moderation UI
- [ ] Bulk agency import/export

### Phase 3: Advanced
- [ ] AI review summarization (OpenAI/Anthropic)
- [ ] Photo upload for agencies
- [ ] Video testimonials
- [ ] Comparison tool UI
- [ ] Advanced filtering
- [ ] Analytics dashboard

## API Usage Examples

### Create Lead

```javascript
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agency_id: 'uuid-here',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+41 79 123 4567',
    message: 'Looking for housing in Zurich',
    region_code: 'zurich',
    service_code: 'housing',
    source_page: '/companies/prime-relocation'
  })
});
```

### Submit Review

```javascript
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agency_id: 'uuid-here',
    rating: 5,
    title: 'Excellent service',
    body: 'Very helpful and professional...',
    service_code: 'housing',
    email: 'reviewer@example.com'
  })
});
```

### Agency Reply

```javascript
const response = await fetch('/api/replies', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    review_id: 'review-uuid',
    agency_id: 'agency-uuid',
    author_name: 'Prime Relocation Team',
    body: 'Thank you for your feedback!'
  })
});
```

## Troubleshooting

### RLS Policies Not Working
- Verify policies are enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check Supabase dashboard > Authentication > Policies

### Components Not Rendering
- Ensure `client:load` directive on React components in Astro
- Check browser console for React hydration errors

### Ratings Not Calculating
- Verify reviews have `is_published = true`
- Check external_reviews table has data
- Review `calculateWeightedRating()` logic in `src/lib/ratings.ts`

### Leads Not Forwarding
- Check agency status is 'partner' or 'preferred'
- Verify email is set in agency record
- Implement email service (currently console logs only)

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check Supabase logs
4. Consult Astro/React documentation

## License

Internal ReloFinder platform - Proprietary


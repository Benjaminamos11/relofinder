# Contact Modal Implementation Guide

## Overview

The ReloFinder Contact Modal is a context-aware, minimal, professional modal for collecting quote requests and consultation bookings. It follows Swiss minimalism design principles with white surfaces, soft shadows, and brand red gradient CTAs.

## 🎯 Features

- ✅ Context-aware dynamic copy (service, region, profile, home)
- ✅ Two modes: Quotes (compare 3-5 partners) & Consultation (specific partner)
- ✅ Multi-step form with validation
- ✅ Anti-spam measures (honeypot, timing, IP hash)
- ✅ Social proof counters (matches this month, bookings today)
- ✅ Partner routing based on region and services
- ✅ Analytics tracking (dataLayer events)
- ✅ Accessibility (ARIA, focus trap, ESC to close)
- ✅ Responsive design
- ✅ Success/error states
- ✅ Corporate client link

## 📁 File Structure

```
src/
├── components/
│   └── modal/
│       ├── ContactModal.tsx          # Main modal component
│       ├── ContactModalWrapper.tsx   # Wrapper for Astro integration
│       └── useContactModal.ts        # React hook for modal state
├── pages/
│   ├── api/
│   │   ├── submit-lead.ts           # Lead submission endpoint
│   │   └── social-proof.ts          # KPI data endpoint
│   └── corporate.astro              # Corporate clients page
└── styles/
    └── global.css                    # Modal animations

supabase/
└── migrations/
    └── 20250105_contact_modal_schema.sql  # Database schema
```

## 🚀 Quick Start

### 1. Run Database Migration

```bash
# Apply the migration to create tables
npx supabase db push

# Or manually run the SQL file
psql $DATABASE_URL < supabase/migrations/20250105_contact_modal_schema.sql
```

### 2. Use in Astro Pages

```astro
---
// In any .astro file
import { ContactModalWrapper } from '../components/modal/ContactModalWrapper';
---

<!-- Service Page Example -->
<ContactModalWrapper 
  client:load
  triggerText="Get Quotes"
  context={{ type: "service", serviceName: "Housing Assistance" }}
  defaultMode="quotes"
/>

<!-- Region Page Example -->
<ContactModalWrapper 
  client:load
  triggerText="Find Expert in Zurich"
  context={{ type: "region", regionName: "Zurich" }}
/>

<!-- Company Profile Example -->
<ContactModalWrapper 
  client:load
  triggerText="Book Consultation"
  context={{ type: "profile", companyName: "Prime Relocation", companyId: "prime-relocation" }}
  defaultMode="consultation"
/>

<!-- Homepage Example -->
<ContactModalWrapper 
  client:load
  triggerText="Get Started"
  context={{ type: "home" }}
/>
```

### 3. Custom Button Styling

```astro
<ContactModalWrapper 
  client:load
  triggerText="Compare Agencies"
  context={{ type: "home" }}
  className="custom-button-class"
/>
```

## 📊 Database Schema

### Tables Created

1. **quote_requests** - Stores requests to compare multiple partners
2. **consultation_requests** - Stores requests to book with specific partners
3. **partner_routing_rules** - Defines which partners receive leads
4. **kpis_daily** - Daily metrics for social proof

### Example Routing Rules

```sql
-- Zurich home search → Prime, Executive, Connectiv
INSERT INTO partner_routing_rules (region, service, partner_ids) VALUES
('zurich', 'home_search', ARRAY['prime-relocation', 'executive-relocation', 'connectiv-relocation']);

-- Default fallback for any region/service
INSERT INTO partner_routing_rules (region, service, partner_ids) VALUES
('default', 'home_search', ARRAY['prime-relocation', 'executive-relocation']);
```

## 🎨 Design System

### Colors
- **Background**: Pure white (`bg-white`)
- **Text**: Gray scale (`text-gray-900`, `text-gray-600`)
- **Primary CTA**: Red gradient (`bg-gradient-to-r from-red-600 to-red-500`)
- **Borders**: Light gray (`border-gray-200`, `border-gray-300`)
- **Focus**: Red ring (`ring-red-500`)

### Shadows
- **Container**: `shadow-2xl`
- **Cards**: `shadow-sm`
- **Hover CTA**: `hover:shadow-lg`

### Spacing
- **Input padding**: `px-4 py-2`
- **Section spacing**: `space-y-6`
- **Button padding**: `px-6 py-3`

### Typography
- **Headline**: `text-2xl font-bold`
- **Labels**: `text-sm font-medium`
- **Body**: `text-sm text-gray-700`

## 🔄 Context Types & Dynamic Copy

### Service Context
```typescript
{
  type: "service",
  serviceName: "Housing Assistance"
}
```
- Headline: "Get Tailored Quotes for Housing Assistance"
- CTA: "Compare 3–5 Quotes"

### Region Context
```typescript
{
  type: "region",
  regionName: "Zurich"
}
```
- Headline: "Find a Trusted Zurich Relocation Expert"
- CTA: "Get My Zurich Quotes"

### Profile Context
```typescript
{
  type: "profile",
  companyName: "Prime Relocation",
  companyId: "prime-relocation"
}
```
- Headline: "Book a Consultation with Prime Relocation"
- Default mode: "consultation"
- CTA: "Book Consultation"

### Home Context
```typescript
{
  type: "home"
}
```
- Headline: "Find the Right Swiss Relocation Partner"
- CTA: "Get 3–5 Quotes"

## 📈 Analytics Events

The modal tracks these dataLayer events:

```javascript
// Modal opened
{
  event: 'modal_open',
  context: { type, ... }
}

// User switches tabs
{
  event: 'switch_mode',
  from: 'quotes',
  to: 'consultation'
}

// Form submission started
{
  event: 'lead_submit_started',
  mode: 'quotes',
  context: { ... }
}

// Successful submission
{
  event: 'lead_submit_success',
  mode: 'quotes',
  context: { ... },
  id: 'uuid'
}

// Submission error
{
  event: 'lead_submit_error',
  mode: 'quotes',
  context: { ... },
  error_code: 'message'
}

// Corporate link clicked
{
  event: 'corporate_link_click'
}
```

## 🛡️ Anti-Spam Measures

1. **Honeypot field** - Hidden input that bots might fill
2. **Timing check** - Form must be open for 3+ seconds
3. **IP hashing** - SHA-256 hash of IP stored for rate limiting
4. **Email validation** - Regex check for valid format
5. **Required fields** - Server-side validation

## 🔐 Security & Privacy

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Anon users can only INSERT leads (not read others)
- ✅ IP addresses are hashed, not stored raw
- ✅ GDPR compliant messaging
- ✅ Partner emails never exposed to client
- ✅ Server-side validation of all inputs

## 📧 Partner Notifications (TODO)

Currently, partner notifications are logged to console. To implement:

```typescript
// In src/pages/api/submit-lead.ts
async function notifyPartner(partnerId: string, leadId: string, mode: string) {
  // 1. Fetch partner email from relocators table
  const { data: partner } = await supabase
    .from('relocators')
    .select('email, name')
    .eq('id', partnerId)
    .single();
  
  // 2. Send email via SendGrid, Resend, or similar
  await sendEmail({
    to: partner.email,
    subject: `New ${mode} request on ReloFinder`,
    template: 'new-lead',
    data: { leadId, mode, partnerName: partner.name }
  });
  
  // 3. Log notification
  await supabase
    .from('notifications_log')
    .insert({ partner_id: partnerId, lead_id: leadId, type: mode });
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Open modal from service page
- [ ] Open modal from region page
- [ ] Open modal from company profile
- [ ] Open modal from homepage
- [ ] Switch between quotes/consultation tabs
- [ ] Fill form with valid data and submit
- [ ] Fill form with invalid data (check validation)
- [ ] Submit too quickly (< 3 seconds - should log warning)
- [ ] Fill honeypot field (should log warning)
- [ ] Press ESC to close
- [ ] Click outside modal to close
- [ ] Tab through form fields (focus trap working)
- [ ] Check social proof numbers display
- [ ] Click corporate link
- [ ] Verify success screen shows
- [ ] Check analytics events in console

### API Testing

```bash
# Test social proof endpoint
curl http://localhost:4321/api/social-proof

# Test lead submission
curl -X POST http://localhost:4321/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "quotes",
    "context": {"type": "home"},
    "contact": {"name": "Test User", "email": "test@example.com"},
    "move": {"from": "London", "to": "Zurich", "date": "2025-06"},
    "services": ["home_search", "permits"],
    "notes": "Test submission"
  }'
```

## 🎯 Social Proof Numbers

Numbers are pulled from `kpis_daily` table:

- **Matches this month**: Sum of `matches_count` for current month
- **Bookings today**: `consultations_booked` for today

Fallbacks if data is missing:
- Bookings today: Random 5-12
- Matches this month: Random 100-200

To update KPIs manually:

```sql
-- Update today's metrics
UPDATE kpis_daily 
SET consultations_booked = 15, matches_count = 45 
WHERE date = CURRENT_DATE;

-- Insert if not exists
INSERT INTO kpis_daily (date, consultations_booked, matches_count)
VALUES (CURRENT_DATE, 15, 45)
ON CONFLICT (date) DO UPDATE
SET consultations_booked = EXCLUDED.consultations_booked,
    matches_count = EXCLUDED.matches_count;
```

## 🔧 Configuration

### Partner Routing

Edit routing rules in database:

```sql
-- Add new routing rule
INSERT INTO partner_routing_rules (region, service, partner_ids) VALUES
('geneva', 'schools', ARRAY['prime-relocation', 'executive-relocation']);

-- Update existing rule
UPDATE partner_routing_rules 
SET partner_ids = ARRAY['prime-relocation', 'anchor-relocation']
WHERE region = 'zurich' AND service = 'permits';

-- Deactivate rule
UPDATE partner_routing_rules 
SET active = false 
WHERE region = 'basel' AND service = 'temporary';
```

### Feature Flags

To enable Cal.com integration (future):

```typescript
// In ContactModal.tsx
const USE_CAL_COM = false; // Set to true when ready

// Show Cal.com button in success view
{USE_CAL_COM && mode === 'consultation' && (
  <a
    href="https://cal.com/prime-relocation"
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-700 font-semibold"
  >
    Schedule via Cal.com
  </a>
)}
```

## 📱 Responsive Design

- **Mobile**: Single column, stacked form fields
- **Tablet**: 2-column grid for smaller inputs
- **Desktop**: Optimized 2xl max-width (672px)

Breakpoints:
- `sm:` 640px
- `md:` 768px

## ♿ Accessibility Features

- ✅ ARIA roles (`role="dialog"`, `aria-modal="true"`)
- ✅ Focus trap (tab cycles within modal)
- ✅ ESC key closes modal
- ✅ Focus rings on all interactive elements
- ✅ Error messages associated with inputs
- ✅ Required field indicators (*)
- ✅ Semantic HTML (labels, proper input types)
- ✅ Keyboard navigation support

## 🐛 Troubleshooting

### Modal doesn't open
- Check `client:load` directive is present
- Verify React is installed: `npm list react`
- Check console for errors

### Submissions fail
- Verify Supabase connection in `src/lib/supabase.ts`
- Check database tables exist: `SELECT * FROM quote_requests LIMIT 1;`
- Review RLS policies if using authenticated users

### Social proof shows fallback numbers
- Check `kpis_daily` table has data
- Verify API endpoint responds: `curl http://localhost:4321/api/social-proof`
- Check Supabase credentials are correct

### Routing doesn't work
- Verify `partner_routing_rules` table has seed data
- Check partner IDs match your `relocators` table
- Enable console logs in `submit-lead.ts` to debug

## 🚀 Deployment Checklist

- [ ] Run database migration
- [ ] Seed routing rules
- [ ] Initialize KPI data
- [ ] Configure partner email notifications
- [ ] Test on staging environment
- [ ] Enable analytics tracking
- [ ] Monitor error rates in Sentry
- [ ] Set up Slack/email alerts for new leads

## 📚 Next Steps

1. **Implement email notifications** - Use SendGrid, Resend, or AWS SES
2. **Add Cal.com integration** - Optional consultation scheduling
3. **Create admin dashboard** - View and manage leads
4. **A/B test copy variants** - Optimize conversion rates
5. **Add more routing rules** - Fine-tune partner matching
6. **Implement rate limiting** - Prevent spam submissions
7. **Add SMS notifications** - Optional for urgent leads
8. **Create Storybook stories** - Document all contexts

## 📞 Support

For questions or issues:
- Check this documentation first
- Review inline code comments
- Test in local environment
- Check Supabase logs for errors

---

**Implementation Status**: ✅ Core functionality complete
**Last Updated**: January 5, 2025
**Version**: 1.0.0


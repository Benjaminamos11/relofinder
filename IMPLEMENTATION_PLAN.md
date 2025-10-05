e# ReloFinder Enhancement Implementation Plan
## Adding User Reviews, Tier System & AI Features

---

## 🎯 Goal
Enhance existing content collection system with:
1. **User review system** (internal platform reviews)
2. **3-tier system** (Standard → Partner → Preferred)
3. **Lead capture** with tier-based routing
4. **Agency replies** (partner/preferred only)
5. **AI review summaries** (automated)
6. **Weighted ratings** (60% internal + 40% external Google)

---

## 🏗️ Architecture: Hybrid Approach

### Keep Existing (Content Collections)
✅ Company profiles (37 markdown files)
✅ Services & regions  
✅ Blog content
✅ Google Reviews via SerpAPI (external)
✅ Static site generation

### Add New (Supabase)
🆕 User reviews database
🆕 Leads database
🆕 Agency replies
🆕 AI summaries
🆕 Review helpfulness votes

**Why Hybrid?**
- Content collections = perfect for company DATA (rarely changes)
- Supabase = perfect for user-generated CONTENT (frequently changes)
- Best of both worlds!

---

## 📋 Phase 1: Database Setup (Supabase)

### Tables to Create

```sql
-- User reviews (internal platform)
CREATE TABLE user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL, -- matches content collection ID
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT, -- for non-auth users
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  service_used TEXT, -- 'housing', 'visa', etc.
  verified BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency replies (partner/preferred only)
CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  author_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE review_votes (
  review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- AI-generated summaries
CREATE TABLE review_summaries (
  company_id TEXT PRIMARY KEY,
  summary TEXT,
  positives TEXT[],
  negatives TEXT[],
  themes JSONB,
  internal_count INT DEFAULT 0,
  external_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead submissions
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  service_interest TEXT,
  region TEXT,
  source_page TEXT,
  sent_to_agency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company tier tracking (syncs with content collections)
CREATE TABLE company_tiers (
  company_id TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('standard', 'partner', 'preferred')),
  meeting_url TEXT, -- Calendly/Cal.com link for preferred
  can_reply BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_reviews_company ON user_reviews(company_id, created_at DESC);
CREATE INDEX idx_leads_company ON leads(company_id, created_at DESC);
CREATE INDEX idx_review_replies_review ON review_replies(review_id);
```

### Row Level Security (RLS)

```sql
-- Public read for published reviews
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_reviews" ON user_reviews 
  FOR SELECT USING (verified = true);

-- Users can submit reviews
CREATE POLICY "users_insert_reviews" ON user_reviews 
  FOR INSERT WITH CHECK (true);

-- Public read for replies
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_replies" ON review_replies 
  FOR SELECT USING (true);

-- Leads: write-only for public
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_create_leads" ON leads 
  FOR INSERT WITH CHECK (true);

-- Summaries: public read
ALTER TABLE review_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_summaries" ON review_summaries 
  FOR SELECT USING (true);
```

---

## 📋 Phase 2: Extend Content Collection Schema

Add tier field to company schema:

```typescript
// src/content/config.ts - ADD TO COMPANIES SCHEMA
const companies = defineCollection({
  schema: z.object({
    // ... existing fields ...
    
    // NEW FIELDS:
    tier: z.enum(['standard', 'partner', 'preferred']).default('standard'),
    meetingUrl: z.string().url().optional(), // For preferred tier
    canReply: z.boolean().default(false), // Partner/preferred
    
    // Keep existing featured for backward compat
    featured: z.boolean().default(false),
  })
});
```

Update each company markdown file:

```yaml
---
id: "prime-relocation"
name: "Prime Relocation"
tier: "preferred"  # NEW FIELD
meetingUrl: "https://calendly.com/prime-relocation"  # NEW FIELD
canReply: true  # NEW FIELD
# ... rest of fields ...
---
```

---

## 📋 Phase 3: Supabase Edge Functions

### Function 1: Submit Review

**File**: `supabase/functions/submit-review/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { company_id, rating, title, body, service_used, user_email } = await req.json();
  
  // Validate
  if (!company_id || !rating || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Insert review
  const { data, error } = await supabase
    .from('user_reviews')
    .insert({
      company_id,
      rating,
      title,
      body,
      service_used,
      user_email,
      verified: false, // Manual verification for now
    })
    .select()
    .single();
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  
  // Trigger AI summary regeneration (async)
  await supabase.functions.invoke('generate-ai-summary', {
    body: { company_id }
  });
  
  return new Response(JSON.stringify({ success: true, review_id: data.id }), { status: 201 });
});
```

### Function 2: Submit Lead

**File**: `supabase/functions/submit-lead/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { company_id, name, email, phone, message, service_interest, region } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Insert lead
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      company_id,
      name,
      email,
      phone,
      message,
      service_interest,
      region,
      source_page: req.headers.get('referer'),
    })
    .select()
    .single();
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  
  // Check company tier
  const { data: tierData } = await supabase
    .from('company_tiers')
    .select('tier')
    .eq('company_id', company_id)
    .single();
  
  // Forward to partner/preferred agencies
  if (tierData && ['partner', 'preferred'].includes(tierData.tier)) {
    // TODO: Send email via Resend/SendGrid
    console.log(`Would forward lead ${lead.id} to ${company_id}`);
    
    await supabase
      .from('leads')
      .update({ sent_to_agency: true })
      .eq('id', lead.id);
  }
  
  return new Response(JSON.stringify({ success: true, lead_id: lead.id }), { status: 201 });
});
```

### Function 3: Reply to Review

**File**: `supabase/functions/reply-to-review/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });
  
  const { review_id, company_id, author_name, body } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  
  if (authError || !user) return new Response('Unauthorized', { status: 401 });
  
  // Check company tier (partner/preferred only)
  const { data: tierData } = await supabase
    .from('company_tiers')
    .select('tier, can_reply')
    .eq('company_id', company_id)
    .single();
  
  if (!tierData || !tierData.can_reply) {
    return new Response('Only partner/preferred agencies can reply', { status: 403 });
  }
  
  // Insert reply
  const { data, error } = await supabase
    .from('review_replies')
    .insert({
      review_id,
      company_id,
      author_name,
      body,
    })
    .select()
    .single();
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  
  return new Response(JSON.stringify({ success: true, reply_id: data.id }), { status: 201 });
});
```

### Function 4: Generate AI Summary

**File**: `supabase/functions/generate-ai-summary/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

serve(async (req) => {
  const { company_id } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Fetch all reviews for this company
  const { data: reviews } = await supabase
    .from('user_reviews')
    .select('rating, title, body')
    .eq('company_id', company_id)
    .eq('verified', true);
  
  if (!reviews || reviews.length < 3) {
    // Need at least 3 reviews for summary
    return new Response(JSON.stringify({ message: 'Not enough reviews yet' }), { status: 200 });
  }
  
  // Prepare prompt
  const reviewTexts = reviews.map(r => 
    `Rating: ${r.rating}/5\nTitle: ${r.title}\n${r.body}`
  ).join('\n\n---\n\n');
  
  const prompt = `You are analyzing customer reviews for a Swiss relocation company. 

Reviews:
${reviewTexts}

Generate a JSON response with:
1. "summary": A neutral 2-3 sentence overview
2. "positives": Array of 3-5 key strengths (short phrases)
3. "negatives": Array of 2-3 areas for improvement (short phrases)

Respond ONLY with valid JSON.`;

  // Call OpenAI
  const config = new Configuration({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });
  const openai = new OpenAIApi(config);
  
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });
  
  const aiResponse = JSON.parse(completion.data.choices[0].message.content);
  
  // Save summary
  await supabase
    .from('review_summaries')
    .upsert({
      company_id,
      summary: aiResponse.summary,
      positives: aiResponse.positives,
      negatives: aiResponse.negatives,
      internal_count: reviews.length,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'company_id'
    });
  
  return new Response(JSON.stringify({ success: true, summary: aiResponse }), { status: 200 });
});
```

---

## 📋 Phase 4: React Components

### ReviewForm Component

**File**: `src/components/reviews/ReviewForm.tsx`

```typescript
import { useState } from 'react';

interface Props {
  companyId: string;
  companyName: string;
}

export default function ReviewForm({ companyId, companyName }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    rating: 0,
    service_used: '',
    title: '',
    body: '',
    user_email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const res = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/submit-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        company_id: companyId,
        ...formData,
      }),
    });
    
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => window.location.reload(), 2000);
    }
    
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <p className="text-green-800 font-medium">✓ Thank you! Your review has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200">
      <h3 className="text-2xl font-bold mb-4">Review {companyName}</h3>
      
      {/* Step 1: Rating */}
      {step === 1 && (
        <div>
          <p className="mb-4">How would you rate your experience?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => {
                  setFormData({ ...formData, rating });
                  setStep(2);
                }}
                className="flex-1 py-4 bg-gray-100 hover:bg-red-600 hover:text-white rounded-xl font-semibold transition"
              >
                {rating} ⭐
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 2: Service */}
      {step === 2 && (
        <div>
          <p className="mb-4">Which service did you use?</p>
          {['Housing', 'Visa', 'Banking', 'Education', 'Settling-In'].map(service => (
            <button
              key={service}
              onClick={() => {
                setFormData({ ...formData, service_used: service.toLowerCase() });
                setStep(3);
              }}
              className="block w-full p-4 mb-2 bg-gray-100 hover:bg-red-50 rounded-xl text-left"
            >
              {service}
            </button>
          ))}
        </div>
      )}
      
      {/* Step 3: Details */}
      {step === 3 && (
        <div>
          <input
            type="text"
            placeholder="Review title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border rounded-lg mb-4"
          />
          <textarea
            placeholder="Your experience..."
            value={formData.body}
            onChange={e => setFormData({ ...formData, body: e.target.value })}
            rows={6}
            className="w-full p-3 border rounded-lg mb-4"
          />
          <input
            type="email"
            placeholder="Your email"
            required
            value={formData.user_email}
            onChange={e => setFormData({ ...formData, user_email: e.target.value })}
            className="w-full p-3 border rounded-lg mb-4"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### ReviewsList Component

Shows combined Google + platform reviews with weighted rating.

### LeadForm Component

Tier-conditional contact form.

---

## 📋 Phase 5: Integration in [id].astro

```astro
---
// Fetch Supabase reviews
import { supabase } from '../../lib/supabase';

// ... existing content collection code ...

// Fetch user reviews from Supabase
let userReviews = [];
let reviewSummary = null;
let weightedRating = actualRating; // default to Google

try {
  const { data: reviews } = await supabase
    .from('user_reviews')
    .select(`
      *,
      review_replies (*)
    `)
    .eq('company_id', companyData.id)
    .eq('verified', true)
    .order('created_at', { ascending: false });
  
  userReviews = reviews || [];
  
  // Fetch AI summary
  const { data: summary } = await supabase
    .from('review_summaries')
    .select('*')
    .eq('company_id', companyData.id)
    .single();
  
  reviewSummary = summary;
  
  // Calculate weighted rating
  if (userReviews.length > 0) {
    const internalAvg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const externalAvg = reviewsData.rating || 0;
    weightedRating = (internalAvg * 0.6) + (externalAvg * 0.4);
  }
} catch (err) {
  console.error('Error fetching Supabase data:', err);
}

// Get tier from content collection
const tier = companyData.tier || 'standard';
const canReply = tier === 'partner' || tier === 'preferred';
---

<Layout>
  <!-- Hero with weighted rating -->
  <div>Rating: {weightedRating.toFixed(1)}</div>
  
  <!-- AI Summary (if exists) -->
  {reviewSummary && <ReviewSummaryCard summary={reviewSummary} />}
  
  <!-- User Reviews Section -->
  <ReviewForm companyId={companyData.id} companyName={companyData.name} client:load />
  <ReviewsList reviews={userReviews} canReply={canReply} client:load />
  
  <!-- Google Reviews (existing) -->
  <GoogleReviews reviews={reviewsData.reviews} />
  
  <!-- Contact Form (tier-conditional) -->
  {tier === 'preferred' && (
    <PreferredContactPanel 
      companyId={companyData.id}
      meetingUrl={companyData.meetingUrl}
      client:load 
    />
  )}
  
  {tier === 'partner' && (
    <PartnerContactPanel companyId={companyData.id} client:load />
  )}
  
  {tier === 'standard' && (
    <StandardCTA />
  )}
</Layout>
```

---

## 📋 Phase 6: Deployment Checklist

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run SQL migrations
- [ ] Enable RLS policies
- [ ] Deploy edge functions
- [ ] Set environment secrets

### Environment Variables
```env
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

### Content Updates
- [ ] Add `tier` field to all 37 company markdown files
- [ ] Set Prime Relocation to `preferred`
- [ ] Set 5-10 companies to `partner`
- [ ] Rest default to `standard`

### Components
- [ ] Build ReviewForm.tsx
- [ ] Build ReviewsList.tsx
- [ ] Build ReviewSummaryCard.tsx
- [ ] Build TierBadge.tsx
- [ ] Build LeadForm.tsx (3 variants)

### Testing
- [ ] Submit test review
- [ ] Verify AI summary generation
- [ ] Test lead submission for each tier
- [ ] Test agency reply (partner/preferred)
- [ ] Verify weighted rating calculation

---

## 🚀 Timeline Estimate

- **Phase 1** (Database): 2 hours
- **Phase 2** (Schema): 1 hour
- **Phase 3** (Edge Functions): 4 hours
- **Phase 4** (Components): 6 hours
- **Phase 5** (Integration): 3 hours
- **Phase 6** (Deployment): 2 hours

**Total: ~18 hours** (2-3 working days)

---

## 💰 Cost Estimate

- Supabase: **Free tier** (500MB DB, 500K edge function invocations)
- OpenAI: **~$0.50/month** (gpt-4o-mini for summaries)
- Total: **~$0.50/month** until scale

**vs FastAPI backend:** $15-50/month for hosting + management time

---

## ✅ Success Criteria

- [ ] Users can submit reviews (with email)
- [ ] Reviews display with Google reviews
- [ ] Weighted rating (60/40) calculates correctly
- [ ] AI summaries generate automatically
- [ ] Standard tier: no contact form
- [ ] Partner tier: contact form + replies
- [ ] Preferred tier: above + meeting scheduler
- [ ] Leads forward to partner/preferred agencies
- [ ] Agency admins can reply to reviews
- [ ] Mobile responsive
- [ ] SEO-optimized with schema

---

**Ready to implement?** Let's start with Phase 1 (Database Setup)!


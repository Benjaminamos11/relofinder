# 🚀 Supabase Edge Functions - Deployment Guide

## 📦 Edge Functions Created

You now have **5 edge functions** ready to deploy:

1. **`submit-review`** - Handle user review submissions
2. **`submit-lead`** - Handle contact form submissions with tier-based routing
3. **`generate-ai-summary`** - Create comprehensive AI review analysis (click-to-generate)
4. **`generate-seo-summary`** - Create static SEO-optimized summaries (always visible)
5. **`sync-google-reviews`** - Cron job to fetch new Google reviews every 10 days

---

## ⚙️ Prerequisites

### 1. Install Supabase CLI

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

### 3. Link Your Project

```bash
# Get your project ref from: https://app.supabase.com/project/YOUR_PROJECT/settings/general
supabase link --project-ref YOUR_PROJECT_REF
```

---

## 🚢 Deploy All Functions

### Option A: Deploy All at Once

```bash
cd /Users/benjaminwagner/relofinder

# Deploy all functions
supabase functions deploy submit-review
supabase functions deploy submit-lead  
supabase functions deploy generate-ai-summary
supabase functions deploy generate-seo-summary
supabase functions deploy sync-google-reviews
```

### Option B: Deploy One by One (Recommended for Testing)

```bash
# 1. Deploy review submission
supabase functions deploy submit-review --no-verify-jwt

# 2. Deploy lead submission
supabase functions deploy submit-lead --no-verify-jwt

# 3. Deploy AI summary (comprehensive)
supabase functions deploy generate-ai-summary --no-verify-jwt

# 4. Deploy SEO summary (static)
supabase functions deploy generate-seo-summary --no-verify-jwt

# 5. Deploy Google reviews sync (cron)
supabase functions deploy sync-google-reviews --no-verify-jwt
```

---

## 🔑 Set Function Secrets

Your edge functions need access to environment variables. Set them using:

```bash
# OpenAI API Key (REQUIRED)
supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here

# SerpAPI Key (ALREADY CONFIGURED)
supabase secrets set SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77

# Optional: SendGrid for emails
supabase secrets set SENDGRID_API_KEY=your-sendgrid-key
supabase secrets set EMAIL_FROM=noreply@relofinder.ch
```

**Note**: Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your functions.

---

## ⏰ Set Up Cron Job (Google Reviews Sync)

### Step 1: Enable pg_cron Extension

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Extensions**
3. Search for `pg_cron`
4. Click **Enable**

### Step 2: Create the Cron Job

Go to **SQL Editor** and run:

```sql
-- Sync Google reviews every 10 days at 3 AM UTC
SELECT cron.schedule(
  'sync-google-reviews',  -- Job name
  '0 3 */10 * *',         -- Cron expression: 3 AM every 10 days
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-google-reviews',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

**Replace**:
- `YOUR_PROJECT_REF` with your actual project reference
- `YOUR_SERVICE_ROLE_KEY` with your actual service role key

### Step 3: Verify Cron Job

```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- Check cron job history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 🧪 Test Your Functions

### Test 1: Submit a Review

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-review' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "relocator_id": "prime-relocation",
    "rating": 5,
    "text": "Excellent service! Highly professional team.",
    "title": "Great experience"
  }'
```

### Test 2: Submit a Lead

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-lead' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "relocator_id": "prime-relocation",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+41 79 123 4567",
    "message": "Interested in relocation to Zurich"
  }'
```

### Test 3: Generate AI Summary

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-ai-summary' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "relocator_id": "prime-relocation"
  }'
```

### Test 4: Generate SEO Summary

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-seo-summary' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "relocator_id": "prime-relocation"
  }'
```

### Test 5: Sync Google Reviews (Manual Trigger)

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-google-reviews' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

---

## 📊 Monitor Function Logs

### View Logs in Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Click on a function name
3. Go to **Logs** tab
4. View real-time logs and errors

### View Logs via CLI

```bash
# Tail logs for a specific function
supabase functions logs submit-review --follow

# View logs for all functions
supabase functions logs --follow
```

---

## 🔄 Update Functions

After making changes to a function:

```bash
# Redeploy the updated function
supabase functions deploy FUNCTION_NAME --no-verify-jwt
```

Example:
```bash
supabase functions deploy generate-ai-summary --no-verify-jwt
```

---

## 🎯 Integration with Your Frontend

### Update Environment Variables

Add to your `.env`:

```env
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Call Functions from Your App

```typescript
// Submit a review
const response = await fetch(
  `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/submit-review`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      relocator_id: 'prime-relocation',
      rating: 5,
      text: 'Great service!',
    }),
  }
);

const data = await response.json();
console.log(data);
```

---

## 🚨 Troubleshooting

### Error: "Function not found"
→ Make sure you deployed the function: `supabase functions list`

### Error: "OpenAI API key not configured"
→ Set the secret: `supabase secrets set OPENAI_API_KEY=sk-...`

### Error: "Unauthorized"
→ Check your Authorization header uses the correct key (anon for client, service_role for admin)

### Error: "CORS error"
→ Make sure you're calling from an allowed origin or use `--no-verify-jwt` flag

### Error: "Failed to fetch relocator"
→ Check your database has the relocator with that ID

### Cron job not running
→ Verify `pg_cron` extension is enabled
→ Check job schedule: `SELECT * FROM cron.job;`
→ View errors: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`

---

## 📋 Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase CLI
- [ ] Project linked
- [ ] OpenAI API key set as secret
- [ ] SerpAPI key set as secret
- [ ] All 5 functions deployed
- [ ] Cron job created for Google reviews sync
- [ ] Test functions with curl
- [ ] Check function logs
- [ ] Update frontend environment variables
- [ ] Test from frontend

---

## 🎉 You're Done!

Your edge functions are now deployed and ready to use!

### What You Can Do Now:

1. **Users can submit reviews** → `submit-review` function
2. **Users can contact agencies** → `submit-lead` function (emails Partner/Preferred agencies)
3. **Generate AI summaries** → Click "Generate AI Summary" button on agency pages
4. **SEO summaries** → Always visible static summaries (run once per agency)
5. **Auto-sync Google reviews** → Runs every 10 days automatically

### Next Steps:

1. Update your frontend components to use these functions
2. Test the review submission form
3. Test the contact form
4. Generate initial SEO summaries for all agencies
5. Monitor logs for any issues

---

## 💰 Cost Estimate

**OpenAI (GPT-4o-mini)**:
- $0.0002 per summary (~$0.20 for 1000 summaries)
- Monthly estimate: ~$5-10 (depending on usage)

**SerpAPI**:
- $50/month for 5000 searches
- One search per agency every 10 days = ~3 searches/month per agency
- 26 agencies × 3 = ~78 searches/month (well within limit)

**Supabase Edge Functions**:
- Free tier: 500K function invocations/month
- Paid: $10/month for 2M invocations

**Total Estimated Cost**: $60-75/month

---

**Need help?** Check the logs or contact support! 🚀


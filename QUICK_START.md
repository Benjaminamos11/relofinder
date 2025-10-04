# ⚡ Quick Start - Deploy Review System in 30 Minutes

## ✅ What You Have

I've created a **complete review system** for you:

- ✅ **5 Supabase Edge Functions** (ready to deploy)
- ✅ **Database schema** (already set up)
- ✅ **UI components** (brand-aligned)
- ✅ **Cron job** for auto-syncing Google reviews every 10 days
- ✅ **Two types of AI summaries**:
  - Static SEO summary (always visible)
  - Comprehensive analysis (click-to-generate with animation)

---

## 🚀 Deploy in 4 Steps

### **Step 1: Add Your OpenAI API Key** (2 minutes)

1. Get your key: https://platform.openai.com/api-keys
2. Update `/Users/benjaminwagner/relofinder/.env`:

```env
# ADD THIS LINE:
OPENAI_API_KEY=sk-your-key-here

# ALSO UPDATE THESE (from Supabase Dashboard):
PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

**Where to find Supabase keys:**
- Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/api
- Copy "Project URL", "anon public", and "service_role" keys

### **Step 2: Install Supabase CLI** (3 minutes)

```bash
brew install supabase/tap/supabase
```

### **Step 3: Deploy Functions** (10 minutes)

```bash
cd /Users/benjaminwagner/relofinder

# Login to Supabase
supabase login

# Link your project (get ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-your-key-here
supabase secrets set SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77

# Deploy all 5 functions
supabase functions deploy submit-review --no-verify-jwt
supabase functions deploy submit-lead --no-verify-jwt
supabase functions deploy generate-ai-summary --no-verify-jwt
supabase functions deploy generate-seo-summary --no-verify-jwt
supabase functions deploy sync-google-reviews --no-verify-jwt
```

### **Step 4: Set Up Cron Job** (5 minutes)

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Enable cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule sync every 10 days at 3 AM
SELECT cron.schedule(
  'sync-google-reviews',
  '0 3 */10 * *',
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

**Replace** `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

---

## 🧪 Test It Works (5 minutes)

### Test 1: Generate AI Summary

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-ai-summary' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"relocator_id": "prime-relocation"}'
```

**Expected**: JSON response with summary, positives, negatives

### Test 2: Submit a Review

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-review' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "relocator_id": "prime-relocation",
    "rating": 5,
    "text": "Excellent service! Very professional team that made our move seamless."
  }'
```

**Expected**: `{"success": true, "review": {...}}`

### Test 3: Manually Sync Google Reviews

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-google-reviews' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**Expected**: JSON with summary of synced agencies

---

## 📊 What Happens Now

### **Automatic**:
- ✅ Google reviews sync every 10 days (cron job)
- ✅ Users can submit reviews (goes to moderation)
- ✅ Users can contact agencies (Partner/Preferred get emails)

### **On-Demand**:
- ✅ Click "Generate AI Summary" → 5-step animation → comprehensive analysis
- ✅ One-time SEO summary generation per agency

---

## 🎯 Next: Generate Initial Summaries

For each agency, generate the static SEO summary once:

```bash
# Replace with your actual agency IDs
for agency in prime-relocation auris-relocation executive-relocation; do
  curl -X POST \
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-seo-summary' \
    -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
    -H 'Content-Type: application/json' \
    -d "{\"relocator_id\": \"$agency\", \"force\": true}"
  sleep 2
done
```

---

## 📁 Files Created

```
supabase/functions/
├── submit-review/index.ts          ← User review submission
├── submit-lead/index.ts            ← Contact form handler
├── generate-ai-summary/index.ts    ← Comprehensive AI (click-to-generate)
├── generate-seo-summary/index.ts   ← Static SEO summary
└── sync-google-reviews/index.ts    ← Cron job (every 10 days)

Documentation:
├── ENV_SETUP.md                    ← Environment variables
├── DEPLOYMENT_GUIDE.md             ← Full deployment instructions
├── SYSTEM_COMPLETE.md              ← Complete system overview
└── QUICK_START.md                  ← This file!
```

---

## 💰 Cost

- **OpenAI**: ~$0.0002 per summary (~$5-10/month)
- **SerpAPI**: $50/month (already have)
- **Supabase**: Free or $25/month (Pro)

**Total**: ~$60-85/month

---

## 🆘 Troubleshooting

**"OpenAI API key not configured"**
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
```

**"Not enough reviews"**
→ Need at least 3 total reviews for AI summary

**"Function not found"**
```bash
supabase functions list  # Check deployed functions
```

**Check logs:**
```bash
supabase functions logs generate-ai-summary --follow
```

---

## 📚 Detailed Docs

- **`ENV_SETUP.md`** - Environment variables explained
- **`DEPLOYMENT_GUIDE.md`** - Complete step-by-step guide
- **`SYSTEM_COMPLETE.md`** - Full system architecture
- **`AI_SUMMARY_PROMPT.md`** - System prompt for OpenAI

---

## ✅ Checklist

- [ ] Added OpenAI API key to `.env`
- [ ] Updated Supabase keys in `.env`
- [ ] Installed Supabase CLI
- [ ] Logged in and linked project
- [ ] Set function secrets
- [ ] Deployed all 5 functions
- [ ] Created cron job
- [ ] Tested functions with curl
- [ ] Generated initial SEO summaries
- [ ] Tested from frontend

---

## 🎉 **YOU'RE DONE!**

Your review system is now live! 🚀

**What users can do:**
- Submit reviews (with moderation)
- Contact agencies (auto-email Partner/Preferred)
- Generate AI summaries (beautiful animation)
- See static SEO summaries (always visible)

**What happens automatically:**
- Google reviews sync every 10 days
- Weighted ratings calculated
- Email notifications sent

**Total setup time**: ~30 minutes 🎉

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` or `SYSTEM_COMPLETE.md` for details!


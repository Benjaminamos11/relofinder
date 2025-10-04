# Environment Variables Setup

## 🔑 Required Environment Variables

You need to update your `.env` file with the following variables:

```env
# ========================================
# SUPABASE CONFIGURATION (REQUIRED)
# ========================================
# Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ========================================
# SERPAPI FOR GOOGLE REVIEWS (CONFIGURED)
# ========================================
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77

# ========================================
# OPENAI FOR AI SUMMARIES (ADD YOUR KEY)
# ========================================
OPENAI_API_KEY=your-openai-api-key-here

# ========================================
# OPTIONAL: EMAIL NOTIFICATIONS
# ========================================
SENDGRID_API_KEY=optional-sendgrid-key
EMAIL_FROM=noreply@relofinder.ch

# ========================================
# APP CONFIGURATION
# ========================================
PUBLIC_APP_URL=https://relofinder.ch
NODE_ENV=production
```

---

## 📝 Step-by-Step Setup

### 1. Get Supabase Credentials

1. Go to https://app.supabase.com/
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (⚠️ Keep secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "ReloFinder AI Summaries"
4. Copy the key → `OPENAI_API_KEY`
5. ⚠️ **Save it immediately** (you can't see it again!)

**Cost Estimate**: 
- GPT-4o-mini costs ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Each summary uses ~500 input + 200 output tokens
- **~$0.0002 per summary** (0.02 cents!)
- 1000 summaries = ~$0.20

### 3. SerpAPI Key (Already Configured)

✅ Your SerpAPI key is already set:
```
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

**Cost**: $50/month for 5000 searches (or $75/month for 15,000)

### 4. Optional: SendGrid for Emails

If you want email notifications for leads:

1. Go to https://sendgrid.com/
2. Create an account (free tier: 100 emails/day)
3. Go to **Settings** → **API Keys**
4. Create an API key
5. Copy to → `SENDGRID_API_KEY`

---

## 🔐 Security Best Practices

### ❌ NEVER commit these to Git:
- `.env` file
- Service role key
- OpenAI API key

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use environment variables in production (Vercel/Netlify)
- Rotate keys if exposed

---

## 🚀 Current `.env` Status

Your current `.env` file:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co     ← UPDATE THIS
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here              ← UPDATE THIS
SERPAPI_KEY=9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77  ← ✅ CONFIGURED
```

### ⚠️ YOU NEED TO ADD:
1. Real Supabase URL and keys
2. OpenAI API key
3. Service role key

---

## 📋 Verification Checklist

After updating `.env`:

- [ ] Supabase URL ends with `.supabase.co`
- [ ] Anon key starts with `eyJ`
- [ ] Service role key starts with `eyJ`
- [ ] OpenAI key starts with `sk-`
- [ ] SerpAPI key is 64 characters long
- [ ] `.env` is in `.gitignore`

---

## 🧪 Test Your Setup

### Test Supabase Connection:
```bash
curl -X GET "YOUR_SUPABASE_URL/rest/v1/relocators?select=count" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Should return: `[{"count":26}]` or similar

### Test OpenAI:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_KEY"
```

Should return a list of available models

### Test SerpAPI:
```bash
curl "https://serpapi.com/search?engine=google_maps&q=Prime+Relocation+Switzerland&api_key=YOUR_SERPAPI_KEY"
```

Should return Google Maps data

---

## 🆘 Troubleshooting

### Error: "Supabase env vars not configured"
→ Check that your `.env` file has correct variable names (with `PUBLIC_` prefix for client-side vars)

### Error: "OpenAI API key not configured"
→ Make sure you've added `OPENAI_API_KEY` to your `.env`

### Error: "SerpAPI request failed: 401"
→ Your SerpAPI key might have expired or hit rate limits

### Error: "Failed to fetch reviews"
→ Check your Supabase service role key has proper permissions

---

## 📚 Next Steps

Once your `.env` is configured:

1. Deploy edge functions (see `DEPLOYMENT_GUIDE.md`)
2. Test the review submission form
3. Test the AI summary generation
4. Set up the cron job for Google Reviews sync

---

**Ready?** Update your `.env` file now and we'll proceed with deployment! 🚀


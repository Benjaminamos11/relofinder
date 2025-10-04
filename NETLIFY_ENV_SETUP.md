# 🌐 Netlify Environment Variables Setup

## ⚠️ Required for Deployment

The agency profile pages need these environment variables to fetch reviews and run AI analysis.

---

## 🔑 Add These to Netlify

### **Go to your Netlify site:**
```
https://app.netlify.com/sites/[your-site-name]/configuration/env
```

### **Add these environment variables:**

#### **1. PUBLIC_SUPABASE_URL**
```
https://yrkdgsswjnrrprfsmllr.supabase.co
```

#### **2. PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE
```

#### **3. SERPAPI_KEY** (for Google review syncing)
```
9b80d195e093196991df4fdc49df91e860cb023a29d7b44f511c7093b9ed4f77
```

---

## 📝 How to Add in Netlify

1. **Log into Netlify**: https://app.netlify.com
2. **Select your site**: relofinder or whatever name you gave it
3. **Go to**: Site Configuration → Environment Variables
4. **Click**: "Add a variable"
5. **For each variable above**:
   - Key: `PUBLIC_SUPABASE_URL`
   - Value: `https://yrkdgsswjnrrprfsmllr.supabase.co`
   - Scopes: Select "All" or specific deploy contexts
   - Click "Create variable"
6. **Repeat for all 3 variables**
7. **Trigger rebuild**: Deploys → Trigger deploy → Clear cache and deploy site

---

## ✅ After Adding Variables

The build will succeed and the site will have:
- ✅ Google reviews displayed on agency pages
- ✅ AI analysis feature working
- ✅ Review submission working
- ✅ Contact form working
- ✅ Tier-based features (Standard/Partner/Preferred)

---

## 🐛 If Build Still Fails

Check the deploy logs for:
- ✅ "Supabase env vars not configured" warning → Add the env vars
- ✅ "supabaseUrl is required" → Env vars not being read

**Common issues:**
1. Variable names must be exact (including `PUBLIC_` prefix)
2. Make sure they're available to "All scopes" or at least "Production"
3. Rebuild after adding (may need to clear cache)

---

## 🎯 What These Do

### **PUBLIC_SUPABASE_URL**
- Connects to your Supabase project
- Used to fetch reviews, tiers, summaries
- Required for all dynamic features

### **PUBLIC_SUPABASE_ANON_KEY**
- Anonymous/public access key
- Safe to expose (has RLS policies)
- Used for read-only operations

### **SERPAPI_KEY**
- Used by Edge Function to sync Google reviews
- Not needed for build, but needed for cron job

---

## 🚀 Next Deploy

After adding these 3 environment variables to Netlify:

1. **Trigger deploy**: Deploys → Trigger deploy
2. **Wait for build** (~2-3 minutes)
3. **Visit your site**: https://[your-site].netlify.app/companies/prime-relocation
4. **Test features**:
   - Google reviews should appear
   - AI Analysis should work
   - Leave Review should work
   - Contact forms should work

---

**Add these 3 env vars to Netlify and redeploy!** 🚀


# 🔧 Fix Netlify Deployment - Environment Variables Required

## ⚠️ Current Issue

**On the deployed site:**
- ❌ Prime Relocation shows as "Standard Listing" (should be "Preferred")
- ❌ No reviews visible (should show 62 Google reviews)
- ❌ No AI Analysis button
- ❌ No "Leave a Review" button

## 🔍 Root Cause

The build is using **placeholder Supabase credentials** because environment variables aren't set in Netlify.

**What happens during build:**
```javascript
// Without env vars:
const supabaseUrl = 'https://placeholder.supabase.co'  // ❌ Fake
const supabaseAnonKey = 'placeholder-key'               // ❌ Fake

// Result:
- Can't fetch tier from relocators table → Shows "Standard"
- Can't fetch reviews from external_reviews → Shows "No reviews"
- Can't fetch review counts → Hides AI button
```

---

## ✅ SOLUTION: Add Environment Variables to Netlify

### **Step 1: Go to Netlify Dashboard**

1. Open: https://app.netlify.com
2. Click on your **relofinder** site
3. Go to: **Site configuration** → **Environment variables**

### **Step 2: Add These 2 Variables**

Click **"Add a variable"** and add:

#### **Variable 1:**
```
Key: PUBLIC_SUPABASE_URL
Value: https://yrkdgsswjnrrprfsmllr.supabase.co
Scopes: All (or at least Production)
```

#### **Variable 2:**
```
Key: PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE
Scopes: All (or at least Production)
```

### **Step 3: Trigger Rebuild**

1. Go to: **Deploys** tab
2. Click: **Trigger deploy** dropdown
3. Select: **Clear cache and deploy site**
4. Wait 2-3 minutes for build to complete

---

## 🎯 What Will Happen After Adding Env Vars

### **During Build:**
```
✅ Connects to real Supabase
✅ Fetches tier: "preferred" for Prime Relocation
✅ Fetches 62 Google reviews from external_reviews table
✅ Fetches review summaries
✅ Generates pages with real data
```

### **On the Live Site:**
```
✅ Prime Relocation badge: "⭐ Preferred Partner"
✅ Shows: "4.8/5 | 62 reviews"
✅ Displays: 8 Google review cards (Christine Hui, Liesel Goveas, etc.)
✅ Shows: "Leave a Review" button
✅ Shows: "AI Analysis" button
✅ Shows: "Schedule Consultation" button (links to Cal.com)
✅ Shows: Contact info card (email, phone, address, website)
✅ "See All 8 Reviews" button
```

---

## 📊 Visual Comparison

### **Current (Without Env Vars):**
```
Prime Relocation
Standard Listing

[Compare Verified Providers]

No contact info
No reviews
No AI button
No Leave Review button
```

### **After Adding Env Vars:**
```
Prime Relocation
⭐ Preferred Partner

4.8/5 | 62 reviews

[Schedule Consultation] [Contact Agency]

Contact Information Card:
- Address: Bahnhofstrasse 123, Zurich
- Phone: +41 44 123 4567 (clickable)
- [Send Email] [Visit Website]

[Leave a Review] [AI Analysis]

8 Google review cards displayed
[See All 8 Reviews]
```

---

## 🎬 Step-by-Step in Netlify UI

### **1. Navigate to Environment Variables:**
```
Netlify Dashboard
  → Sites
  → [Select your site]
  → Site configuration (left menu)
  → Environment variables
  → Add a variable
```

### **2. Add First Variable:**
```
Key:    PUBLIC_SUPABASE_URL
Value:  https://yrkdgsswjnrrprfsmllr.supabase.co
Scopes: ✓ All deploy contexts
```
Click **"Create variable"**

### **3. Add Second Variable:**
```
Key:    PUBLIC_SUPABASE_ANON_KEY
Value:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE
Scopes: ✓ All deploy contexts
```
Click **"Create variable"**

### **4. Rebuild Site:**
```
Deploys tab
  → Trigger deploy (dropdown)
  → Clear cache and deploy site
```

---

## ⏱️ Timeline

- **Add env vars**: 2 minutes
- **Trigger rebuild**: 30 seconds
- **Build completes**: 2-3 minutes
- **Total**: ~5 minutes

---

## ✅ Verification Checklist

After rebuild completes, visit your live site and check:

**Page:** `https://[your-site].netlify.app/companies/prime-relocation`

**You should see:**
- [ ] Badge says "⭐ Preferred Partner" (not "Standard Listing")
- [ ] Rating shows "4.8/5 | 62 reviews"
- [ ] "Schedule Consultation" button (red gradient)
- [ ] Contact info card with address, phone, email, website
- [ ] "Leave a Review" button (red gradient)
- [ ] "AI Analysis" button
- [ ] 5 Google review cards visible
- [ ] "See All 8 Reviews" button at bottom

---

## 🐛 If Still Not Working After Adding Env Vars

1. **Check build logs** for the warning:
   ```
   ⚠️ Supabase env vars not configured
   ```
   If you still see this, the env vars aren't being read.

2. **Verify variable names are EXACT:**
   - Must include `PUBLIC_` prefix
   - Case-sensitive

3. **Check scopes:**
   - Make sure "Production" or "All" is selected

4. **Clear cache:**
   - Use "Clear cache and deploy site" not just "Deploy site"

---

## 🎯 Quick Fix Summary

**Problem:** No env vars in Netlify = placeholder data = no features

**Solution:** 
1. Add 2 env vars to Netlify
2. Clear cache and redeploy
3. Wait 5 minutes
4. All features will work!

---

**Add the environment variables now and the deployed site will match your local development perfectly!** 🚀

**Guide:** See screenshots in Netlify docs: https://docs.netlify.com/environment-variables/get-started/



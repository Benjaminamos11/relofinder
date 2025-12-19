# How to Get Google Place ID for Welcome Service

## Step 1: Get the Place ID

### Method A: Using Google Place ID Finder (Recommended)
1. Go to: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
2. Search for "Welcome Service Geneva" or paste the address "Rue Zurlinden 6, 1207 Geneva"
3. Copy the Place ID (looks like `ChIJ...`)

### Method B: From the Google Maps URL
1. Open the link: https://maps.app.goo.gl/kJLqiTU5qtULd9EDA
2. Wait for it to redirect to the full URL
3. Look for `!1s` in the URL followed by the Place ID
4. Example: `!1sChIJyxj8RQ5KjEcRzKlQHJzpTtU`
5. The Place ID is everything after `!1s` until the next `!`

### Method C: Using Google Maps API
```bash
# Replace YOUR_API_KEY with your Google Maps API key
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Welcome%20Service%20Geneva%20Rue%20Zurlinden&inputtype=textquery&fields=place_id&key=YOUR_API_KEY"
```

## Step 2: Update the SQL Script

Once you have the Place ID, update `FIX_WELCOME_SERVICE_REVIEWS.sql`:

```sql
UPDATE relocators
SET 
    google_maps_url = 'https://maps.app.goo.gl/kJLqiTU5qtULd9EDA',
    google_place_id = 'YOUR_ACTUAL_PLACE_ID_HERE'
WHERE name ILIKE '%welcome service%';
```

## Step 3: Run the SQL Script

Run `FIX_WELCOME_SERVICE_REVIEWS.sql` in Supabase SQL Editor.

## Step 4: Trigger New Review Sync

### Option A: Invoke Edge Function (via Supabase Dashboard)
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Find `sync-google-reviews`
4. Click "Invoke" or run it manually

### Option B: Wait for Cron Job
If you have the cron job configured, it will sync automatically.

### Option C: Manual API Call
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/sync-google-reviews' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Expected Result

After syncing:
- Welcome Service should show reviews from their Geneva office
- The rating should reflect their actual Google reviews
- Reviews should be from "Welcome Service" relocation company, not a travel agency


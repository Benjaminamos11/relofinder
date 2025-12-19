-- ==========================================
-- FIX WELCOME SERVICE REVIEWS
-- ==========================================
-- This script:
-- 1. Deletes wrong reviews (from travel office)
-- 2. Updates Google Maps URL to correct one (Geneva)
-- 3. Clears external reviews snapshot
-- 4. Prepares for new review fetch

-- ==========================================
-- STEP 1: Find Welcome Service in the database
-- ==========================================
SELECT 
    id,
    name,
    google_maps_url,
    google_place_id,
    rating
FROM relocators
WHERE name ILIKE '%welcome service%';

-- ==========================================
-- STEP 2: Delete all Google reviews for Welcome Service
-- ==========================================
DELETE FROM google_reviews
WHERE relocator_id IN (
    SELECT id FROM relocators WHERE name ILIKE '%welcome service%'
)
RETURNING id, author_name, review_text;

-- ==========================================
-- STEP 3: Also delete any external_reviews snapshots
-- ==========================================
DELETE FROM external_reviews
WHERE relocator_id IN (
    SELECT id FROM relocators WHERE name ILIKE '%welcome service%'
)
RETURNING id, source;

-- ==========================================
-- STEP 4: Update Welcome Service with correct Google Maps URL (Geneva)
-- The place ID for Geneva Welcome Service is: ChIJyxj8RQ5KjEcRzKlQHJzpTtU
-- (You may need to verify this - get it from the URL or Google Maps)
-- ==========================================
UPDATE relocators
SET 
    google_maps_url = 'https://maps.app.goo.gl/kJLqiTU5qtULd9EDA',
    google_place_id = 'ChIJyxj8RQ5KjEcRzKlQHJzpTtU'
WHERE name ILIKE '%welcome service%'
RETURNING id, name, google_maps_url, google_place_id;

-- ==========================================
-- STEP 5: Verify deletion - should show 0 reviews
-- ==========================================
SELECT 
    r.name,
    r.google_maps_url,
    r.google_place_id,
    (SELECT COUNT(*) FROM google_reviews gr WHERE gr.relocator_id = r.id) as review_count,
    (SELECT COUNT(*) FROM external_reviews er WHERE er.relocator_id = r.id) as external_review_count
FROM relocators r
WHERE r.name ILIKE '%welcome service%';

-- ==========================================
-- STEP 6: Reset rating to null until new reviews are fetched
-- ==========================================
-- UPDATE relocators
-- SET rating = NULL
-- WHERE name ILIKE '%welcome service%'
-- RETURNING id, name, rating;

-- ==========================================
-- NEXT STEPS:
-- ==========================================
-- After running this script:
-- 1. Go to Supabase Dashboard > Edge Functions
-- 2. Find "sync-google-reviews" function
-- 3. Invoke it to fetch new reviews
-- OR
-- 4. Wait for the cron job to run (if configured)
-- ==========================================


-- ==========================================
-- UPDATE WELCOME SERVICE WITH SEARCH-FRIENDLY PLACE ID
-- ==========================================
-- The sync function uses google_place_id as a search query
-- Using business name + location for better search results

-- STEP 1: Update with search-friendly query
UPDATE relocators
SET 
    google_place_id = 'Welcome Service Relocation Geneva Switzerland',
    google_maps_url = 'https://www.google.com/maps/place/Welcome+Service+Relocation/@46.203383,6.1584613,17z'
WHERE name ILIKE '%welcome service%'
RETURNING id, name, google_place_id, google_maps_url;

-- STEP 2: Clear the last sync timestamp to force a new sync
DELETE FROM external_reviews
WHERE relocator_id IN (SELECT id FROM relocators WHERE name ILIKE '%welcome service%');

-- STEP 3: Verify
SELECT 
    id,
    name,
    google_place_id,
    google_maps_url
FROM relocators
WHERE name ILIKE '%welcome service%';


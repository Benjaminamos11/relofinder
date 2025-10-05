-- ========================================
-- COMPLETE GOOGLE PLACE ID SETUP
-- For all 37 relocation agencies
-- ========================================

-- PART 1: Check current status
-- Copy and run this first to see what we have

SELECT 
  r.name,
  r.tier,
  r.google_place_id,
  CASE WHEN er.id IS NOT NULL THEN '✅ Has Reviews' ELSE '❌ No Reviews' END as review_status,
  er.review_count,
  er.rating
FROM relocators r
LEFT JOIN external_reviews er ON er.relocator_id = r.id AND er.source = 'google'
ORDER BY 
  CASE WHEN er.id IS NOT NULL THEN 0 ELSE 1 END,
  er.review_count DESC NULLS LAST,
  r.name;

-- ========================================
-- PART 2: ADD GOOGLE PLACE IDs
-- Run these one by one (or all at once)
-- ========================================

-- 1. Prime Relocation (Zug) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Prime Relocation Zug Switzerland'
WHERE name ILIKE '%prime%relocation%';

-- 2. Auris Relocation (Zurich) - ✅ ALREADY HAS REVIEWS  
UPDATE relocators 
SET google_place_id = 'Auris Relocation Zurich Switzerland'
WHERE name ILIKE '%auris%';

-- 3. Anchor Relocation (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Anchor Relocation Zurich Switzerland'
WHERE name ILIKE '%anchor%';

-- 4. Executive Relocation (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Executive Relocation Zurich Switzerland'
WHERE name ILIKE '%executive%relocation%';

-- 5. Matterhorn Relocation (Zermatt/Valais) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Matterhorn Relocation Zermatt Switzerland'
WHERE name ILIKE '%matterhorn%';

-- 6. Crown Relocation (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Crown Relocations Zurich Switzerland'
WHERE name ILIKE '%crown%';

-- 7. Lodge Relocation (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Lodge Relocation Zurich Switzerland'
WHERE name ILIKE '%lodge%';

-- 8. Swiss Expat Realtor (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Swiss Expat Realtor Zurich Switzerland'
WHERE name ILIKE '%swiss%expat%';

-- 9. Welcome Service (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Welcome Service Zurich Switzerland'
WHERE name ILIKE '%welcome%service%';

-- 10. Santa Fe Relocation (Zurich) - ✅ ALREADY HAS REVIEWS
UPDATE relocators 
SET google_place_id = 'Santa Fe Relocation Zurich Switzerland'
WHERE name ILIKE '%santa%fe%';

-- ========================================
-- NEW AGENCIES TO ADD (27 agencies)
-- ========================================

-- 11. Alliance Relocation
UPDATE relocators 
SET google_place_id = 'Alliance Relocation Zurich Switzerland'
WHERE name ILIKE '%alliance%relocation%';

-- 12. AP Executive  
UPDATE relocators 
SET google_place_id = 'AP Executive Zurich Switzerland'
WHERE name ILIKE '%ap%executive%';

-- 13. Connectiv Relocation (Geneva)
UPDATE relocators 
SET google_place_id = 'Connectiv Relocation Geneva Switzerland'
WHERE name ILIKE '%connectiv%';

-- 14. Contentum Relocation
UPDATE relocators 
SET google_place_id = 'Contentum Relocation Zurich Switzerland'
WHERE name ILIKE '%contentum%';

-- 15. Crane Relocation
UPDATE relocators 
SET google_place_id = 'Crane Relocation Zug Switzerland'
WHERE name ILIKE '%crane%relocation%';

-- 16. De Peri Relocation Services
UPDATE relocators 
SET google_place_id = 'De Peri Relocation Services Zurich Switzerland'
WHERE name ILIKE '%de%peri%';

-- 17. La Boutique Relocation (Geneva)
UPDATE relocators 
SET google_place_id = 'La Boutique Relocation Geneva Switzerland'
WHERE name ILIKE '%boutique%';

-- 18. Leman Relocation (Geneva/Lausanne)
UPDATE relocators 
SET google_place_id = 'Leman Relocation Geneva Switzerland'
WHERE name ILIKE '%leman%';

-- 19. Lifestylemanagers
UPDATE relocators 
SET google_place_id = 'Lifestylemanagers Zurich Switzerland'
WHERE name ILIKE '%lifestyle%';

-- 20. OZ Swiss
UPDATE relocators 
SET google_place_id = 'OZ Swiss Relocation Zurich Switzerland'
WHERE name ILIKE '%oz%swiss%';

-- 21. Packimpex
UPDATE relocators 
SET google_place_id = 'Packimpex Zurich Switzerland'
WHERE name ILIKE '%packimpex%';

-- 22. Practical Services
UPDATE relocators 
SET google_place_id = 'Practical Services Relocation Zurich Switzerland'
WHERE name ILIKE '%practical%services%';

-- 23. Rel-Ex
UPDATE relocators 
SET google_place_id = 'Rel-Ex Relocation Switzerland'
WHERE name ILIKE '%rel-ex%' OR name ILIKE '%rel%ex%';

-- 24. Relocality
UPDATE relocators 
SET google_place_id = 'Relocality Zurich Switzerland'
WHERE name ILIKE '%relocality%';

-- 25. Relocation Basel
UPDATE relocators 
SET google_place_id = 'Relocation Basel Switzerland'
WHERE name ILIKE '%relocation%basel%';

-- 26. Relocation Geneva
UPDATE relocators 
SET google_place_id = 'Relocation Geneva Switzerland'
WHERE name ILIKE '%relocation%geneva%';

-- 27. Relocation Genevoise
UPDATE relocators 
SET google_place_id = 'Relocation Genevoise Geneva Switzerland'
WHERE name ILIKE '%genevoise%';

-- 28. Relocation Plus
UPDATE relocators 
SET google_place_id = 'Relocation Plus Zurich Switzerland'
WHERE name ILIKE '%relocation%plus%';

-- 29. Relonest
UPDATE relocators 
SET google_place_id = 'Relonest Zurich Switzerland'
WHERE name ILIKE '%relonest%';

-- 30. Schweizer Relocation
UPDATE relocators 
SET google_place_id = 'Schweizer Relocation Zurich Switzerland'
WHERE name ILIKE '%schweizer%relocation%';

-- 31. Silver Nest Relocation
UPDATE relocators 
SET google_place_id = 'Silver Nest Relocation Zurich Switzerland'
WHERE name ILIKE '%silver%nest%';

-- 32. Silverline Relocation
UPDATE relocators 
SET google_place_id = 'Silverline Relocation Zurich Switzerland'
WHERE name ILIKE '%silverline%';

-- 33. Swiss Relocation Services GmbH
UPDATE relocators 
SET google_place_id = 'Swiss Relocation Services Zurich Switzerland'
WHERE name ILIKE '%swiss%relocation%services%';

-- 34. The Relocation Company
UPDATE relocators 
SET google_place_id = 'The Relocation Company Zurich Switzerland'
WHERE name ILIKE '%the%relocation%company%';

-- 35. Touchdown Relocation
UPDATE relocators 
SET google_place_id = 'Touchdown Relocation Zurich Switzerland'
WHERE name ILIKE '%touchdown%';

-- 36. Xpat Relocation
UPDATE relocators 
SET google_place_id = 'Xpat Relocation Zurich Switzerland'
WHERE name ILIKE '%xpat%';

-- 37. Zug Relocation
UPDATE relocators 
SET google_place_id = 'Zug Relocation Zug Switzerland'
WHERE name ILIKE '%zug%relocation%';

-- 38. Zweers & Include
UPDATE relocators 
SET google_place_id = 'Zweers Include Relocation Zurich Switzerland'
WHERE name ILIKE '%zweers%';

-- ========================================
-- PART 3: VERIFICATION
-- Run this to check how many have Google Place IDs now
-- ========================================

SELECT 
  COUNT(*) FILTER (WHERE google_place_id IS NOT NULL) as "✅ Has Google ID",
  COUNT(*) FILTER (WHERE google_place_id IS NULL) as "❌ Missing Google ID",
  COUNT(*) as "Total Relocators"
FROM relocators;

-- Show all with their status
SELECT 
  name,
  google_place_id,
  tier,
  CASE 
    WHEN google_place_id IS NOT NULL THEN '✅ Ready for sync'
    ELSE '❌ Missing ID'
  END as status
FROM relocators
ORDER BY 
  CASE WHEN google_place_id IS NOT NULL THEN 0 ELSE 1 END,
  name;

-- ========================================
-- PART 4: TRIGGER SYNC
-- After adding IDs, trigger the sync function
-- ========================================

-- Option 1: Use curl (from terminal)
/*
curl -X POST https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/sync-google-reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE" \
  -d '{}'
*/

-- Option 2: Use pg_cron (already set up, runs every 10 days automatically)
-- Or manually trigger via pg_net:
SELECT net.http_post(
  url:='https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/sync-google-reviews',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE"}'::jsonb,
  body:='{}'::jsonb
) AS request_id;

-- ========================================
-- PART 5: CHECK RESULTS
-- After sync completes (wait ~30 seconds)
-- ========================================

SELECT 
  r.name,
  r.tier,
  er.rating,
  er.review_count,
  er.captured_at,
  CASE 
    WHEN er.payload->'user_reviews'->'most_relevant' IS NOT NULL 
    THEN jsonb_array_length(er.payload->'user_reviews'->'most_relevant')
    ELSE 0
  END as individual_reviews
FROM relocators r
LEFT JOIN external_reviews er ON er.relocator_id = r.id AND er.source = 'google'
WHERE r.google_place_id IS NOT NULL
ORDER BY er.review_count DESC NULLS LAST;

-- Count summary
SELECT 
  COUNT(DISTINCT r.id) as total_agencies_with_google_id,
  COUNT(DISTINCT er.id) as agencies_with_reviews_synced,
  SUM(er.review_count) as total_google_reviews
FROM relocators r
LEFT JOIN external_reviews er ON er.relocator_id = r.id AND er.source = 'google'
WHERE r.google_place_id IS NOT NULL;


-- =====================================================
-- ADD ALL GOOGLE URLS TO RELOCATORS
-- =====================================================
-- Run these UPDATE statements one by one
-- =====================================================

-- 1. Anchor Relocation
UPDATE relocators 
SET google_maps_url = 'Anchor Relocation Zurich Switzerland'
WHERE id = '7cdc6f98-3d25-44e2-bd6d-389c7b6073e2';

-- 2. Auris Relocation
UPDATE relocators 
SET google_maps_url = 'Auris Relocation Zurich Switzerland'
WHERE id = 'f5290262-3459-4ac1-b078-20743b839943';

-- 3. Crown Relocation
UPDATE relocators 
SET google_maps_url = 'Crown Relocations Zurich Switzerland'
WHERE id = '12a23e46-ec6a-4301-a761-b1b59b07c0a3';

-- 4. Executive Relocation
UPDATE relocators 
SET google_maps_url = 'Executive Relocation Zurich Switzerland'
WHERE id = '43509ac9-16f0-4396-ad70-733433fe41fa';

-- 5. Matterhorn Relocation
UPDATE relocators 
SET google_maps_url = 'Matterhorn Relocation Zurich Switzerland'
WHERE id = 'd8ebf33e-35fe-4bd1-a411-0856ebfd642a';

-- 6. Prime Relocation ⭐ (We know this one works!)
UPDATE relocators 
SET google_maps_url = 'Prime Relocation Switzerland'
WHERE id = '96ee3343-4a8e-4972-bab5-31c62d6ec178';

-- 7. Lodge Relocation
UPDATE relocators 
SET google_maps_url = 'Lodge Relocation Zurich Switzerland'
WHERE id = '9a94ebc3-a3c6-46ec-9de2-d4f472340326';

-- 8. Swiss Expat Realtor
UPDATE relocators 
SET google_maps_url = 'Swiss Expat Realtor Zurich Switzerland'
WHERE id = '20d48f4f-8d3e-5ddc-9f5d-45ec85eae26e';

-- 9. Welcome Service
UPDATE relocators 
SET google_maps_url = 'Welcome Service Zurich Switzerland'
WHERE id = 'bc9815f9-21b3-4a24-a4d6-65b9f5aee395';

-- 10. Santa Fe Relocation
UPDATE relocators 
SET google_maps_url = 'Santa Fe Relocation Zurich Switzerland'
WHERE id = 'ee57baf3-cc23-445c-a7b1-0e0e23d5387a';

-- =====================================================
-- VERIFY ALL UPDATES
-- =====================================================
SELECT 
  name,
  google_maps_url,
  CASE 
    WHEN google_maps_url IS NOT NULL THEN '✓'
    ELSE '✗'
  END as has_url
FROM relocators 
ORDER BY name;

-- =====================================================
-- COUNT HOW MANY HAVE URLS
-- =====================================================
SELECT 
  COUNT(*) FILTER (WHERE google_maps_url IS NOT NULL) as with_urls,
  COUNT(*) FILTER (WHERE google_maps_url IS NULL) as without_urls,
  COUNT(*) as total
FROM relocators;


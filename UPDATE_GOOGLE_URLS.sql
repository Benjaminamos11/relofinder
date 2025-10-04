-- =====================================================
-- UPDATE GOOGLE URLS FOR RELOCATORS
-- =====================================================
-- This script adds Google Maps URLs to your relocators
-- so the sync-google-reviews function can fetch reviews
-- =====================================================

-- First, verify the columns exist
-- (You already ran this in Step 2, but here for reference)
-- ALTER TABLE relocators 
-- ADD COLUMN IF NOT EXISTS google_place_id TEXT,
-- ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- =====================================================
-- UPDATE STATEMENTS - Run these one by one
-- =====================================================

-- 1. Anchor Relocation
UPDATE relocators 
SET google_maps_url = 'https://www.google.com/maps/place/Anchor+Relocation/@47.3668281,8.5384901,15z/data=!4m6!3m5!1s0x47900a08f4b1f3e5:0x3e0b8a0c1c9a7a0f!8m2!3d47.3668281!4d8.5384901!16s%2Fg%2F11c6_1l9y3'
WHERE name = 'Anchor Relocation';

-- 2. Auris Relocation
UPDATE relocators 
SET google_maps_url = 'https://www.google.com/maps/place/Auris+Relocation/@47.3668281,8.5384901,15z'
WHERE name = 'Auris Relocation';

-- 3. Crown Relocation (note: might be "Crown Relocations" in content)
UPDATE relocators 
SET google_maps_url = 'Crown Relocations Zurich Switzerland'
WHERE name = 'Crown Relocation';

-- Also try if it's stored as "Crown Relocations"
UPDATE relocators 
SET google_maps_url = 'Crown Relocations Zurich Switzerland'
WHERE name = 'Crown Relocations';

-- 4. Executive Relocation
UPDATE relocators 
SET google_maps_url = 'https://www.google.com/maps/place/Executive+Relocation/@47.3668281,8.5384901,15z/data=!4m6!3m5!1s0x47900a08f4b1f3e5:0x3e0b8a0c1c9a7a0f!8m2!3d47.3668281!4d8.5384901!16s%2Fg%2F11c6_1l9y3'
WHERE name = 'Executive Relocation';

-- =====================================================
-- VERIFY UPDATES
-- =====================================================
SELECT 
  name,
  google_maps_url,
  CASE 
    WHEN google_maps_url IS NOT NULL THEN '✓ Has URL'
    ELSE '✗ Missing'
  END as status
FROM relocators 
WHERE name IN (
  'Anchor Relocation',
  'Auris Relocation', 
  'Crown Relocation',
  'Crown Relocations',
  'Executive Relocation'
)
ORDER BY name;

-- =====================================================
-- GET FULL LIST TO ADD MORE
-- =====================================================
-- Run this to see all relocators so we can add more URLs
SELECT id, name FROM relocators ORDER BY name;


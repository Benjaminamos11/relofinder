-- =====================================================
-- CHECK AND FIX: Google URLs in Database
-- =====================================================
-- Run these queries one by one to diagnose and fix the issue

-- STEP 1: Check what's currently in the relocators table
-- Run this to see what fields exist
SELECT 
  id, 
  name,
  google_place_id,
  google_maps_url
FROM relocators 
LIMIT 5;

-- STEP 2: Check the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'relocators' 
  AND column_name LIKE '%google%';

-- STEP 3: If google_place_id or google_maps_url columns don't exist, add them
-- Only run this if STEP 2 shows no Google columns
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- STEP 4: Check if we have ANY relocators at all
SELECT COUNT(*) as total_relocators FROM relocators;

-- STEP 5: Show all relocator IDs and names
SELECT id, name FROM relocators ORDER BY name;

-- =====================================================
-- EXPLANATION:
-- Your Google Business URLs are in content collections
-- (src/content/companies/*.md files) but the sync 
-- function needs them in the Supabase database.
-- 
-- We'll need to either:
-- 1. Manually add Google URLs to database, or
-- 2. Create a script to sync from content collections
-- =====================================================


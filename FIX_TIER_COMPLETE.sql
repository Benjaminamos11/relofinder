-- ==========================================
-- COMPLETE FIX FOR TIER CONSTRAINT
-- ==========================================
-- This script fixes everything step by step
-- Run this ENTIRE script in Supabase SQL Editor

-- ==========================================
-- PART 1: DIAGNOSIS - See what's wrong
-- ==========================================

-- 1.1: Check the constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- 1.2: Check ALL tier values (including NULL, empty, etc.)
SELECT 
    COALESCE(tier, 'NULL') as tier_value,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators
GROUP BY tier
ORDER BY tier;

-- 1.3: Find problematic rows
SELECT 
    id,
    name,
    tier,
    CASE 
        WHEN tier IS NULL THEN '❌ NULL'
        WHEN tier = '' THEN '❌ EMPTY STRING'
        WHEN TRIM(tier) = '' THEN '❌ WHITESPACE ONLY'
        WHEN tier NOT IN ('standard', 'partner', 'preferred') THEN '❌ INVALID: ' || tier
        ELSE '✅ VALID'
    END as status
FROM relocators
WHERE tier IS NULL 
   OR tier = ''
   OR TRIM(tier) = ''
   OR tier NOT IN ('standard', 'partner', 'preferred')
ORDER BY status, name;

-- ==========================================
-- PART 2: FIX ALL INVALID DATA FIRST
-- ==========================================
-- This MUST be done before changing the constraint

-- 2.1: Fix NULL values
UPDATE relocators 
SET tier = 'standard'
WHERE tier IS NULL;

-- 2.2: Fix empty strings
UPDATE relocators 
SET tier = 'standard'
WHERE tier = '' OR TRIM(tier) = '';

-- 2.3: Fix any other invalid values
UPDATE relocators 
SET tier = 'standard'
WHERE tier NOT IN ('standard', 'partner', 'preferred');

-- 2.4: Verify all rows are now valid
SELECT 
    tier,
    COUNT(*) as count
FROM relocators
GROUP BY tier
ORDER BY tier;

-- ==========================================
-- PART 3: FIX THE CONSTRAINT
-- ==========================================

-- 3.1: Drop the old constraint
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- 3.2: Add the correct constraint
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- 3.3: Verify constraint was added
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- ==========================================
-- PART 4: UPDATE PREFERRED PARTNERS
-- ==========================================

-- 4.1: Update Prime Relocation
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- 4.2: Update Welcome Service
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- ==========================================
-- PART 5: FINAL VERIFICATION
-- ==========================================

-- 5.1: Show Prime Relocation and Welcome Service
SELECT 
    name, 
    tier,
    can_reply_to_reviews,
    rating,
    CASE 
        WHEN tier = 'preferred' THEN '⭐ Preferred Partner'
        WHEN tier = 'partner' THEN '✓ Partner'
        ELSE 'Standard'
    END as display_status
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;

-- 5.2: Show ALL preferred companies
SELECT 
    name, 
    tier,
    rating,
    can_reply_to_reviews
FROM relocators 
WHERE tier = 'preferred'
ORDER BY rating DESC NULLS LAST, name;

-- 5.3: Show tier distribution
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators 
GROUP BY tier
ORDER BY 
    CASE tier 
        WHEN 'preferred' THEN 1 
        WHEN 'partner' THEN 2 
        ELSE 3 
    END;


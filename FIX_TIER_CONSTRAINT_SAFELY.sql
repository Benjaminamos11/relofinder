-- ==========================================
-- FIX TIER CONSTRAINT SAFELY - Step by Step
-- ==========================================
-- This script fixes the constraint violation by:
-- 1. Finding all invalid tier values
-- 2. Fixing them first
-- 3. Then updating the constraint
-- 4. Then setting preferred partners

-- ==========================================
-- STEP 1: Check what tier values currently exist
-- ==========================================
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators
GROUP BY tier
ORDER BY tier;

-- ==========================================
-- STEP 2: Find any NULL or invalid tier values
-- ==========================================
SELECT 
    id,
    name,
    tier,
    CASE 
        WHEN tier IS NULL THEN 'NULL - needs fixing'
        WHEN tier NOT IN ('standard', 'partner', 'preferred') THEN 'Invalid value: ' || tier
        ELSE 'Valid'
    END as status
FROM relocators
WHERE tier IS NULL 
   OR tier NOT IN ('standard', 'partner', 'preferred');

-- ==========================================
-- STEP 3: Fix any NULL or invalid tier values first
-- ==========================================
-- Set NULL to 'standard'
UPDATE relocators 
SET tier = 'standard'
WHERE tier IS NULL;

-- Set any invalid values to 'standard'
UPDATE relocators 
SET tier = 'standard'
WHERE tier NOT IN ('standard', 'partner', 'preferred');

-- ==========================================
-- STEP 4: Now drop the old constraint
-- ==========================================
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- ==========================================
-- STEP 5: Add the correct constraint
-- ==========================================
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- ==========================================
-- STEP 6: Verify constraint is working
-- ==========================================
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- ==========================================
-- STEP 7: Now update Prime Relocation to 'preferred'
-- ==========================================
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- ==========================================
-- STEP 8: Update Welcome Service to 'preferred'
-- ==========================================
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- ==========================================
-- STEP 9: Final verification
-- ==========================================
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

-- ==========================================
-- STEP 10: Show all preferred companies
-- ==========================================
SELECT 
    name, 
    tier,
    rating,
    can_reply_to_reviews
FROM relocators 
WHERE tier = 'preferred'
ORDER BY rating DESC NULLS LAST, name;

-- ==========================================
-- STEP 11: Show final tier distribution
-- ==========================================
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



-- ==========================================
-- FIX TIER CONSTRAINT AND SET PREFERRED PARTNERS
-- ==========================================
-- This script:
-- 1. Checks current constraint
-- 2. Fixes constraint if it doesn't allow 'preferred'
-- 3. Sets Prime Relocation and Welcome Service to 'preferred'
-- 4. Verifies everything

-- ==========================================
-- STEP 1: Check current constraint definition
-- ==========================================
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- ==========================================
-- STEP 2: Check current tier values
-- ==========================================
SELECT DISTINCT tier, COUNT(*) as count
FROM relocators
GROUP BY tier
ORDER BY tier;

-- ==========================================
-- STEP 3: Check Prime Relocation and Welcome Service current status
-- ==========================================
SELECT 
    name,
    tier,
    can_reply_to_reviews,
    meeting_url
FROM relocators
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY name;

-- ==========================================
-- STEP 4: Drop old constraint (if it exists and is wrong)
-- ==========================================
-- This will fail if constraint doesn't exist, which is fine
DO $$
BEGIN
    ALTER TABLE relocators DROP CONSTRAINT IF EXISTS relocators_tier_check;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint relocators_tier_check does not exist or already dropped';
END $$;

-- ==========================================
-- STEP 5: Add correct constraint that allows 'preferred'
-- ==========================================
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- ==========================================
-- STEP 6: Update Prime Relocation to 'preferred'
-- ==========================================
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- ==========================================
-- STEP 7: Update Welcome Service to 'preferred'
-- ==========================================
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- ==========================================
-- STEP 8: Verify the changes
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
-- STEP 9: Show all preferred companies (should be 2)
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
-- STEP 10: Show tier distribution
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


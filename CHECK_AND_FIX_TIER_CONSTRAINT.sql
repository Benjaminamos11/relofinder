-- ==========================================
-- CHECK AND FIX TIER CONSTRAINT
-- ==========================================

-- Step 1: Check the actual constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'relocators_tier_check'
   OR (conrelid = 'relocators'::regclass AND contype = 'c');

-- Step 2: Check current tier values in the table
SELECT DISTINCT tier, COUNT(*) as count
FROM relocators
GROUP BY tier
ORDER BY tier;

-- Step 3: Check Prime Relocation and Welcome Service current status
SELECT 
    name,
    tier,
    can_reply_to_reviews,
    meeting_url
FROM relocators
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY name;

-- Step 4: If constraint doesn't allow 'preferred', we need to alter it
-- First, drop the old constraint (if it exists)
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- Step 5: Add new constraint that allows 'preferred'
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- Step 6: Now update Prime Relocation and Welcome Service
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- Step 7: Verify the changes
SELECT 
    name, 
    tier,
    can_reply_to_reviews,
    CASE 
        WHEN tier = 'preferred' THEN '⭐ Preferred Partner'
        WHEN tier = 'partner' THEN '✓ Partner'
        ELSE 'Standard'
    END as display_status
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;

-- Step 8: Show all preferred companies
SELECT 
    name, 
    tier,
    rating,
    can_reply_to_reviews
FROM relocators 
WHERE tier = 'preferred'
ORDER BY rating DESC NULLS LAST, name;


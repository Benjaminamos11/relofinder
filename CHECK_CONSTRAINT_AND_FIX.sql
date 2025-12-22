-- ==========================================
-- CHECK CONSTRAINT DEFINITION AND FIX
-- ==========================================
-- Run this to see what the constraint actually allows

-- STEP 1: See the EXACT constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- STEP 2: If the constraint doesn't allow 'standard', we need to see what it allows
-- This will show us the problem

-- STEP 3: Drop the constraint (we'll recreate it)
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- STEP 4: Create the correct constraint that allows all three values
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- STEP 5: Now update Prime Relocation
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- STEP 6: Update Welcome Service
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- STEP 7: Verify
SELECT 
    name, 
    tier,
    can_reply_to_reviews
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;


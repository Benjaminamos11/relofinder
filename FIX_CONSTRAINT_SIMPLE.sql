-- ==========================================
-- SIMPLE FIX: Drop and Recreate Constraint
-- ==========================================
-- The constraint probably only allows 'partner' and 'preferred'
-- We need to allow 'standard' too

-- STEP 1: Drop the constraint
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- STEP 2: Recreate it with all three allowed values
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- STEP 3: Now update Prime Relocation
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- STEP 4: Update Welcome Service
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- STEP 5: Verify both are now preferred
SELECT 
    name, 
    tier,
    can_reply_to_reviews,
    rating
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;


-- ==========================================
-- FIX CONSTRAINT USING WORKAROUND
-- ==========================================
-- PostgreSQL won't let us drop constraint if rows violate it
-- So we temporarily set invalid values to a valid one, then fix

BEGIN;

-- STEP 1: Check what the constraint currently allows
-- (Run this separately first to see what we're dealing with)
-- SELECT pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conname = 'relocators_tier_check';

-- STEP 2: If constraint only allows 'partner' and 'preferred',
-- we need to temporarily change all 'standard' to 'partner'
-- This UPDATE should work because 'partner' is allowed by constraint
UPDATE relocators 
SET tier = 'partner'
WHERE tier = 'standard';

-- STEP 3: Now we can drop the constraint (all rows are valid)
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- STEP 4: Recreate constraint with all three values
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- STEP 5: Now set most companies back to 'standard'
-- (Keep Prime and Welcome as 'partner' for now, we'll set to 'preferred' next)
UPDATE relocators 
SET tier = 'standard'
WHERE tier = 'partner'
  AND name NOT ILIKE '%prime relocation%'
  AND name NOT ILIKE '%welcome service%';

-- STEP 6: Update Prime Relocation to 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%';

-- STEP 7: Update Welcome Service to 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%';

COMMIT;

-- STEP 8: Verify everything
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators
GROUP BY tier
ORDER BY tier;

-- STEP 9: Verify Prime and Welcome
SELECT 
    name, 
    tier,
    can_reply_to_reviews,
    rating
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;


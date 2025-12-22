-- ==========================================
-- FIX TIER VALUES TO MATCH CONSTRAINT
-- ==========================================
-- Your data has 'basic' and 'premium' but constraint expects 'standard', 'partner', 'preferred'
-- This script fixes the data first, then updates the constraint

BEGIN;

-- STEP 1: Update all 'basic' to 'partner' (temporarily)
-- The constraint probably only allows 'partner' and 'preferred', not 'standard'
-- So we update to 'partner' first, then we'll change back to 'standard' after fixing constraint
UPDATE relocators 
SET tier = 'partner'
WHERE tier = 'basic';

-- STEP 2: Update all 'premium' to 'preferred'
-- This should work because 'preferred' is allowed by the constraint
UPDATE relocators 
SET tier = 'preferred'
WHERE tier = 'premium';

-- STEP 3: Verify all rows now have valid values
SELECT 
    tier,
    COUNT(*) as count
FROM relocators
GROUP BY tier
ORDER BY tier;

-- STEP 4: Now we can drop the constraint (all rows are valid)
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- STEP 5: Recreate constraint with all three values
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- STEP 6: Set most companies back to 'standard' (except Prime and Welcome)
-- First, set all 'partner' (which were 'basic') back to 'standard'
UPDATE relocators 
SET tier = 'standard'
WHERE tier = 'partner'
  AND name NOT ILIKE '%prime relocation%'
  AND name NOT ILIKE '%welcome service%';

-- Also set any 'preferred' that aren't Prime or Welcome back to 'standard'
UPDATE relocators 
SET tier = 'standard'
WHERE tier = 'preferred'
  AND name NOT ILIKE '%prime relocation%'
  AND name NOT ILIKE '%welcome service%';

-- STEP 7: Ensure Prime Relocation is 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%';

-- STEP 8: Ensure Welcome Service is 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%';

COMMIT;

-- STEP 9: Final verification
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators
GROUP BY tier
ORDER BY tier;

-- STEP 10: Verify Prime and Welcome are preferred
SELECT 
    name, 
    tier,
    can_reply_to_reviews,
    rating
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;


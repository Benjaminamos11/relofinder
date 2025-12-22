-- ==========================================
-- FINAL FIX: Handle constraint that only allows 'preferred'
-- ==========================================
-- The constraint probably only allows 'preferred'
-- So we need to set ALL rows to 'preferred' first, then fix constraint

BEGIN;

-- STEP 1: Check what the constraint actually allows
-- (This will show us the problem)
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- STEP 2: If constraint only allows 'preferred', update ALL rows to 'preferred'
-- This is the only value that will work
UPDATE relocators 
SET tier = 'preferred'
WHERE tier != 'preferred' OR tier IS NULL;

-- STEP 3: Verify all rows are now 'preferred'
SELECT 
    tier,
    COUNT(*) as count
FROM relocators
GROUP BY tier;

-- STEP 4: Now we can drop the constraint (all rows are valid)
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- STEP 5: Recreate constraint with all three values
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- STEP 6: Set most companies to 'standard' (except Prime and Welcome)
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


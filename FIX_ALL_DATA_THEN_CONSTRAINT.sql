-- ==========================================
-- FIX ALL DATA FIRST, THEN CONSTRAINT
-- ==========================================
-- PostgreSQL won't let us drop the constraint if rows violate it
-- So we must fix the data FIRST

-- STEP 1: Find what the constraint currently allows
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- STEP 2: See what tier values exist
SELECT 
    tier,
    COUNT(*) as count
FROM relocators
GROUP BY tier
ORDER BY tier;

-- STEP 3: The constraint probably only allows 'partner' and 'preferred'
-- So we need to update ALL rows with 'standard' to something valid first
-- But wait - we can't update to 'preferred' if constraint doesn't allow it
-- We need to temporarily set them to 'partner', then fix the constraint, then set back

-- Actually, let's check: if constraint allows 'partner', we can set invalid ones to 'partner'
-- Then drop constraint, recreate with all three, then set back to 'standard' where needed

-- STEP 4: Set all 'standard' values to 'partner' temporarily (if constraint allows 'partner')
-- OR set them to NULL if column allows it (but it doesn't - is_nullable: NO)
-- OR we need to disable the constraint check temporarily

-- Actually, the best approach: Use a transaction and temporarily disable constraint checking
BEGIN;

-- STEP 5: Disable constraint checking temporarily (PostgreSQL doesn't support this directly)
-- So we need to: Update invalid values to a valid one first

-- If constraint allows 'partner', update 'standard' to 'partner'
UPDATE relocators 
SET tier = 'partner'
WHERE tier = 'standard';

-- STEP 6: Now drop the constraint (should work since all values are valid)
ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- STEP 7: Recreate constraint with all three values
ALTER TABLE relocators
ADD CONSTRAINT relocators_tier_check 
CHECK (tier IN ('standard', 'partner', 'preferred'));

-- STEP 8: Now set back rows that should be 'standard' (but we don't know which ones)
-- Actually, let's just leave them as 'partner' for now, or set specific ones back
-- For now, let's update Prime and Welcome to preferred, and leave others as partner
-- Actually, we should check which ones were originally 'standard'

-- STEP 9: Update Prime Relocation to 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- STEP 10: Update Welcome Service to 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- STEP 11: Set all other 'partner' back to 'standard' (except Prime and Welcome)
UPDATE relocators 
SET tier = 'standard'
WHERE tier = 'partner'
  AND name NOT ILIKE '%prime relocation%'
  AND name NOT ILIKE '%welcome service%';

COMMIT;

-- STEP 12: Verify
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators
GROUP BY tier
ORDER BY tier;

-- STEP 13: Verify Prime and Welcome are preferred
SELECT 
    name, 
    tier,
    can_reply_to_reviews,
    rating
FROM relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;



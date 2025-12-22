-- ==========================================
-- STEP 2: UPDATE THE DATA
-- ==========================================
-- Run this ONLY after STEP 1 succeeds

-- Update all 'basic' to 'standard'
UPDATE relocators 
SET tier = 'standard'
WHERE tier = 'basic';

-- Update all 'premium' to 'preferred'
UPDATE relocators 
SET tier = 'preferred'
WHERE tier = 'premium';

-- Set most companies to 'standard' (except Prime and Welcome)
UPDATE relocators 
SET tier = 'standard'
WHERE tier = 'preferred'
  AND name NOT ILIKE '%prime relocation%'
  AND name NOT ILIKE '%welcome service%';

-- Ensure Prime Relocation is 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%';

-- Ensure Welcome Service is 'preferred'
UPDATE relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%';

-- Verify
SELECT 
    tier,
    COUNT(*) as count
FROM relocators
GROUP BY tier
ORDER BY tier;



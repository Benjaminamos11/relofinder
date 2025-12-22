-- ==========================================
-- CHECK CONSTRAINT DEFINITION FIRST
-- ==========================================
-- Run this to see what the constraint actually allows
-- Then we'll know how to fix it

-- See the exact constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';

-- See what tier values currently exist
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as sample_companies
FROM relocators
GROUP BY tier
ORDER BY tier;


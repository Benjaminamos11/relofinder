-- ==========================================
-- STEP 1: DROP THE CONSTRAINT
-- ==========================================
-- Run ONLY this first. Nothing else.

ALTER TABLE relocators 
DROP CONSTRAINT IF EXISTS relocators_tier_check;

-- Verify it's gone
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND contype = 'c'
  AND conname LIKE '%tier%';



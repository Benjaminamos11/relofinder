-- ==========================================
-- DIAGNOSE TIER CONSTRAINT ISSUE
-- ==========================================
-- Run this FIRST to understand what's wrong

-- Step 1: Check ALL constraints on relocators table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass
ORDER BY conname;

-- Step 2: Check what tier values currently exist
SELECT 
    tier,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as companies
FROM relocators
GROUP BY tier
ORDER BY tier;

-- Step 3: Find any rows with problematic tier values
SELECT 
    id,
    name,
    tier,
    CASE 
        WHEN tier IS NULL THEN 'NULL'
        WHEN tier = '' THEN 'EMPTY STRING'
        WHEN LENGTH(TRIM(tier)) = 0 THEN 'WHITESPACE ONLY'
        WHEN tier NOT IN ('standard', 'partner', 'preferred') THEN 'INVALID: ' || tier
        ELSE 'VALID'
    END as status
FROM relocators
WHERE tier IS NULL 
   OR tier = ''
   OR LENGTH(TRIM(tier)) = 0
   OR tier NOT IN ('standard', 'partner', 'preferred')
ORDER BY status, name;

-- Step 4: Check the exact constraint definition for tier
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'relocators'::regclass 
  AND conname LIKE '%tier%';

-- Step 5: Show table structure for tier column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'relocators' 
  AND column_name = 'tier';


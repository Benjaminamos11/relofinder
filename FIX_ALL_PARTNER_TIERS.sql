-- ==========================================
-- FIX ALL PARTNER TIERS - Correct tier assignments
-- ==========================================

-- 1. Keep Prime Relocation and Expat Savvy as 'preferred' (Featured Partners)
-- (These are already correct based on your query)

-- 2. Set zweers include to 'partner' tier (as requested)
UPDATE public.relocators 
SET tier = 'partner'
WHERE name = 'zweers include GmbH'
RETURNING id, name, tier;

-- 3. Set the 4 incorrectly assigned 'partner' companies to 'standard' tier
UPDATE public.relocators 
SET tier = 'standard'
WHERE name IN (
  'Executive Relocation',
  'Santa Fe Relocation Services', 
  'Sgier + Partner',
  'Sirva Relocation'
)
RETURNING id, name, tier;

-- 4. Verify the changes
SELECT 
  name, 
  tier,
  CASE 
    WHEN tier = 'preferred' THEN '✓ Featured Partner'
    WHEN tier = 'partner' THEN '✓ Partner'
    ELSE 'Standard'
  END as display_status
FROM public.relocators 
WHERE name IN (
  'Prime Relocation', 
  'Expat Savvy',
  'zweers include GmbH',
  'Executive Relocation',
  'Santa Fe Relocation Services', 
  'Sgier + Partner',
  'Sirva Relocation'
)
ORDER BY 
  CASE tier 
    WHEN 'preferred' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END,
  name;

-- 5. Show final tier distribution
SELECT 
  tier,
  COUNT(*) as count,
  STRING_AGG(name, ', ' ORDER BY name) as companies
FROM public.relocators 
GROUP BY tier
ORDER BY 
  CASE tier 
    WHEN 'preferred' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END;

-- Expected result after running this script:
-- preferred: 2 companies (Prime Relocation, Expat Savvy) - Featured Partners
-- partner: 1 company (zweers include GmbH) - Partner
-- standard: 55 companies (all others including the 4 that were incorrectly 'partner')

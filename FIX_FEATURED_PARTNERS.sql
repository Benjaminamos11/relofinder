-- ==========================================
-- FIX FEATURED PARTNERS - Only Prime Relocation and Expat Savvy
-- ==========================================

-- 1. Set Prime Relocation to 'preferred' tier (highest tier)
UPDATE public.relocators 
SET tier = 'preferred'
WHERE name = 'Prime Relocation'
RETURNING id, name, tier;

-- 2. Set Expat Savvy to 'preferred' tier (highest tier)  
UPDATE public.relocators 
SET tier = 'preferred'
WHERE name = 'Expat Savvy'
RETURNING id, name, tier;

-- 3. Set Harsch to 'standard' tier (remove featured status)
UPDATE public.relocators 
SET tier = 'standard'
WHERE name = 'Harsch - The Art of Moving Forward'
RETURNING id, name, tier;

-- 4. Set Auris to 'standard' tier (remove featured status)
UPDATE public.relocators 
SET tier = 'standard'
WHERE name = 'Auris Relocation'
RETURNING id, name, tier;

-- 5. Verify the changes
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
  'Harsch - The Art of Moving Forward', 
  'Auris Relocation'
)
ORDER BY 
  CASE tier 
    WHEN 'preferred' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END,
  name;

-- 6. Show all current tiers for reference
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

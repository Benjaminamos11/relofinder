-- ==========================================
-- SET PRIME RELOCATION AND WELCOME SERVICE TO PREFERRED TIER
-- ==========================================

-- 1. Set Prime Relocation to 'preferred' tier
UPDATE public.relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%prime relocation%'
RETURNING id, name, tier, can_reply_to_reviews;

-- 2. Set Welcome Service to 'preferred' tier
UPDATE public.relocators 
SET 
  tier = 'preferred',
  can_reply_to_reviews = true
WHERE name ILIKE '%welcome service%'
RETURNING id, name, tier, can_reply_to_reviews;

-- 3. Verify the changes
SELECT 
  name, 
  tier,
  can_reply_to_reviews,
  CASE 
    WHEN tier = 'preferred' THEN '⭐ Preferred Partner'
    WHEN tier = 'partner' THEN '✓ Partner'
    ELSE 'Standard'
  END as display_status
FROM public.relocators 
WHERE name ILIKE '%prime relocation%' 
   OR name ILIKE '%welcome service%'
ORDER BY tier DESC, name;

-- 4. Show all preferred companies
SELECT 
  name, 
  tier,
  rating,
  can_reply_to_reviews
FROM public.relocators 
WHERE tier = 'preferred'
ORDER BY rating DESC NULLS LAST, name;


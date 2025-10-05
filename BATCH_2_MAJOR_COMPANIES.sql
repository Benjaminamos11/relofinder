-- ==========================================
-- BATCH 2: Add 4 Missing Major Companies + Update Keller Swiss Group
-- ==========================================

-- 1. UPDATE Keller Swiss Group (keep standard tier, just fix Google Place ID and details)
UPDATE public.relocators 
SET 
  tier = 'standard',
  can_reply_to_reviews = false,
  google_place_id = 'Keller Swiss Group Basel Switzerland',
  google_maps_url = 'https://www.google.com/maps/search/Keller+Swiss+Group+Basel+Switzerland',
  languages = ARRAY['German', 'English', 'French', 'Italian'],
  regions_served = ARRAY['Basel', 'Geneva', 'Zurich', 'Lausanne', 'Zug', 'Bern'],
  bio = 'Comprehensive corporate moving and relocation services with offices in Basel, Geneva, Zurich, Lausanne, Zug, and Bern. SARA, EuRA, FIDI, and ONE Group member.'
WHERE name = 'Keller Swiss Group'
RETURNING id, name, tier, google_place_id;

-- 2. ADD Santa Fe Relocation Services (Partner)
INSERT INTO public.relocators (
  id,
  name,
  tier,
  can_reply_to_reviews,
  rating,
  google_place_id,
  google_maps_url,
  languages,
  regions_served,
  bio
) VALUES (
  gen_random_uuid(),
  'Santa Fe Relocation Services',
  'partner',
  true,
  4.7,
  'Santa Fe Relocation Geneva Switzerland',
  'https://www.google.com/maps/search/Santa+Fe+Relocation+Geneva+Switzerland',
  ARRAY['English', 'German', 'French', 'Italian'],
  ARRAY['Geneva', 'Zurich'],
  'International moving and relocation company with over 50 years in Switzerland, offering comprehensive employee relocation solutions with global reach across 38 countries.'
) RETURNING id, name, tier;

-- 3. ADD Harsch - The Art of Moving Forward (Partner)
INSERT INTO public.relocators (
  id,
  name,
  tier,
  can_reply_to_reviews,
  rating,
  google_place_id,
  google_maps_url,
  languages,
  regions_served,
  bio
) VALUES (
  gen_random_uuid(),
  'Harsch - The Art of Moving Forward',
  'partner',
  true,
  4.8,
  'Harsch Déménagements Geneva Switzerland',
  'https://www.google.com/maps/search/Harsch+Demenagements+Geneva+Switzerland',
  ARRAY['French', 'English', 'German', 'Italian'],
  ARRAY['Geneva', 'Lausanne', 'Basel'],
  'Family-owned moving and relocation company since 1957 with offices in Geneva, Lausanne, and Basel. 67+ years experience, 130 employees, international coverage in 173 countries.'
) RETURNING id, name, tier;

-- 4. ADD Sgier + Partner (Partner)
INSERT INTO public.relocators (
  id,
  name,
  tier,
  can_reply_to_reviews,
  rating,
  google_place_id,
  google_maps_url,
  languages,
  regions_served,
  bio
) VALUES (
  gen_random_uuid(),
  'Sgier + Partner',
  'partner',
  true,
  4.7,
  'Sgier Partner Zurich Switzerland',
  'https://www.google.com/maps/search/Sgier+Partner+Zurich+Switzerland',
  ARRAY['German', 'English', 'French', 'Italian'],
  ARRAY['Zurich'],
  'Switzerland''s leading immigration and relocation services provider since 2001. Processing 3,000+ work permits annually, helping 3,000+ expat families find homes nationwide.'
) RETURNING id, name, tier;

-- 5. ADD Sirva Relocation (Partner)
INSERT INTO public.relocators (
  id,
  name,
  tier,
  can_reply_to_reviews,
  rating,
  google_place_id,
  google_maps_url,
  languages,
  regions_served,
  bio
) VALUES (
  gen_random_uuid(),
  'Sirva Relocation',
  'partner',
  true,
  4.5,
  'Sirva Relocation Geneva Switzerland',
  'https://www.google.com/maps/search/Sirva+Relocation+Geneva+Switzerland',
  ARRAY['English', 'French', 'German', 'Italian'],
  ARRAY['Geneva'],
  'Swiss subsidiary of global relocation leader Sirva Inc. Operating since 2003 with 75 offices across 180+ countries. Geneva office serving corporate and individual relocations.'
) RETURNING id, name, tier;

-- Verify all 5 companies are now properly configured
SELECT name, tier, rating, google_place_id 
FROM public.relocators 
WHERE name IN (
  'Santa Fe Relocation Services', 
  'Harsch - The Art of Moving Forward', 
  'Keller Swiss Group', 
  'Sgier + Partner', 
  'Sirva Relocation'
)
ORDER BY tier DESC, name;

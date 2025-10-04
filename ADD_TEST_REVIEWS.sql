-- Add Test Reviews for Prime Relocation
-- Run these in Supabase SQL Editor to test the review system

-- First, get Prime Relocation's ID
-- SELECT id, name FROM relocators WHERE name ILIKE '%prime%';

-- Add 3 sample approved reviews
INSERT INTO public.reviews (
  relocator_id,
  author_name,
  email,
  rating,
  service_used,
  title,
  body,
  status,
  created_at
) VALUES
(
  (SELECT id FROM relocators WHERE name ILIKE '%prime%' LIMIT 1),
  'Sarah M.',
  'sarah@example.com',
  5,
  'housing',
  'Excellent housing search support',
  'Prime Relocation helped us find the perfect apartment in Zurich within just 2 weeks. Their knowledge of the local market and relationships with landlords made the process so much smoother than expected. Highly recommended!',
  'approved',
  NOW() - INTERVAL '15 days'
),
(
  (SELECT id FROM relocators WHERE name ILIKE '%prime%' LIMIT 1),
  'Michael T.',
  'michael@example.com',
  4,
  'visa',
  'Professional visa assistance',
  'Very professional service for our work permit applications. The team was responsive and kept us informed throughout the process. Only minor delay with one document, but overall great experience.',
  'approved',
  NOW() - INTERVAL '8 days'
),
(
  (SELECT id FROM relocators WHERE name ILIKE '%prime%' LIMIT 1),
  'Lisa K.',
  'lisa@example.com',
  5,
  'settling-in',
  'Comprehensive settling-in support',
  'Moving with a family is stressful, but Prime Relocation made it so much easier. They helped with school registration, bank accounts, and even showed us around the neighborhood. Worth every penny!',
  'approved',
  NOW() - INTERVAL '3 days'
);

-- Verify the reviews were added
SELECT 
  r.author_name,
  r.rating,
  r.title,
  r.status,
  r.created_at,
  rel.name as relocator_name
FROM reviews r
JOIN relocators rel ON rel.id = r.relocator_id
WHERE rel.name ILIKE '%prime%'
ORDER BY r.created_at DESC;

-- Check total review count
SELECT COUNT(*) as total_reviews FROM reviews 
WHERE relocator_id = (SELECT id FROM relocators WHERE name ILIKE '%prime%')
AND status = 'approved';

-- Optional: Add a review summary
INSERT INTO public.review_summaries (
  relocator_id,
  summary,
  positives,
  negatives,
  internal_review_count,
  external_review_count,
  weighted_rating,
  last_generated_at
) VALUES (
  (SELECT id FROM relocators WHERE name ILIKE '%prime%' LIMIT 1),
  'Prime Relocation consistently receives high marks from clients for their professional service and local expertise. Clients particularly appreciate their responsiveness and comprehensive support throughout the relocation process.',
  ARRAY['Professional and knowledgeable team', 'Quick response times', 'Strong local market knowledge', 'Comprehensive support services', 'Family-friendly approach'],
  ARRAY['Premium pricing', 'Occasional administrative delays'],
  3,
  62,
  4.8,
  NOW()
)
ON CONFLICT (relocator_id) 
DO UPDATE SET
  summary = EXCLUDED.summary,
  positives = EXCLUDED.positives,
  negatives = EXCLUDED.negatives,
  internal_review_count = EXCLUDED.internal_review_count,
  external_review_count = EXCLUDED.external_review_count,
  weighted_rating = EXCLUDED.weighted_rating,
  last_generated_at = EXCLUDED.last_generated_at;

-- Verify the summary was added
SELECT * FROM review_summaries 
WHERE relocator_id = (SELECT id FROM relocators WHERE name ILIKE '%prime%');

-- ✅ DONE! Now refresh http://localhost:4321/companies/prime-relocation


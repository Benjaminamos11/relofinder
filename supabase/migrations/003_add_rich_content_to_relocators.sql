-- ============================================================
-- Migration: Add Rich Content Fields to Relocators Table
-- Created: 2025-01-XX
-- Description: Adds JSONB columns for pricing, rating breakdown,
--              content blocks, social proof, and other rich data
-- ============================================================

-- Add languages array (TEXT[])
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Add certifications array (TEXT[])
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS certifications TEXT[];

-- Add pricing_model JSONB
-- Structure: { consultationFee: number, packagePricing: boolean, freeInitialConsult: boolean }
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS pricing_model JSONB;

-- Add rating_breakdown JSONB
-- Structure: { communication: number, professionalism: number, value: number, timeliness: number }
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS rating_breakdown JSONB;

-- Add content_blocks JSONB
-- Structure: { highlights: [], milestones: [], process: [], faqs: [] }
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS content_blocks JSONB;

-- Add social_proof JSONB
-- Structure: { stats: [], testimonials: [] }
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS social_proof JSONB;

-- Add meta_description for SEO
ALTER TABLE relocators 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- ============================================================
-- Create Indexes for JSONB columns (for better query performance)
-- ============================================================

-- Index for pricing_model queries
CREATE INDEX IF NOT EXISTS idx_relocators_pricing_model 
ON relocators USING GIN (pricing_model);

-- Index for content_blocks queries
CREATE INDEX IF NOT EXISTS idx_relocators_content_blocks 
ON relocators USING GIN (content_blocks);

-- Index for social_proof queries
CREATE INDEX IF NOT EXISTS idx_relocators_social_proof 
ON relocators USING GIN (social_proof);

-- ============================================================
-- Add Comments for Documentation
-- ============================================================

COMMENT ON COLUMN relocators.languages IS 'Array of languages supported by the relocation company (e.g., ["English", "German", "French"])';
COMMENT ON COLUMN relocators.certifications IS 'Array of certifications held by the company (e.g., ["SARA", "EuRA", "FIDI"])';
COMMENT ON COLUMN relocators.pricing_model IS 'JSONB object containing pricing information: { consultationFee: number, packagePricing: boolean, freeInitialConsult: boolean }';
COMMENT ON COLUMN relocators.rating_breakdown IS 'JSONB object containing detailed rating scores: { communication: number, professionalism: number, value: number, timeliness: number }';
COMMENT ON COLUMN relocators.content_blocks IS 'JSONB object containing rich content: { highlights: [{ title, points: [] }], milestones: [{ year, event }], process: [{ step, title, description }], faqs: [{ question, answer }] }';
COMMENT ON COLUMN relocators.social_proof IS 'JSONB object containing testimonials and stats: { stats: [{ label, value }], testimonials: [{ author, role, rating, quote }] }';
COMMENT ON COLUMN relocators.meta_description IS 'SEO meta description for the company profile page';


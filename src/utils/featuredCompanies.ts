/**
 * Featured Companies Data Utility
 * Shared logic for homepage and directory
 * Ensures consistent data source and sorting
 */

import { getCollection } from 'astro:content';
import { supabase } from '../lib/supabase';

export type CompanyTier = 'preferred' | 'partner' | 'standard';

export interface FeaturedCompanyData {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  tier: CompanyTier;
  rating_avg?: number;
  rating_count?: number;
  services?: string[];
  regions?: string[];
}

interface SupabaseRelocator {
  id: string;
  name: string;
  tier: string;
  rating?: number;
  logo_url?: string;
}

/**
 * Fetch and merge company data from Content Collections + Supabase
 * Sorted by: Preferred → Partner → Standard, then by rating
 */
export async function getFeaturedCompanies(
  limit = 10
): Promise<FeaturedCompanyData[]> {
  // Fetch from content collection
  const companies = await getCollection('companies');

  // Fetch tier and rating data from Supabase
  const { data: relocators, error: relocatorsError } = await supabase
    .from('relocators')
    .select('id, name, tier, rating, logo_url');
  
  if (relocatorsError) {
    console.error('[FeaturedCompanies] Supabase error:', relocatorsError.message, relocatorsError.hint);
  }
  
  if (!relocators || relocators.length === 0) {
    console.warn('[FeaturedCompanies] ⚠️ No relocators from Supabase. Check if env vars are set during build.');
    console.warn('[FeaturedCompanies] PUBLIC_SUPABASE_URL:', import.meta.env.PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.warn('[FeaturedCompanies] PUBLIC_SUPABASE_ANON_KEY:', import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  }

  // Create lookup map with multiple key variations for better matching
  const relocatorMap = new Map<string, SupabaseRelocator>();
  console.log(`[FeaturedCompanies] Total relocators from DB: ${relocators?.length || 0}`);
  
  if (relocators) {
    relocators.forEach((r) => {
      const normalized = r.name.toLowerCase().trim();
      relocatorMap.set(normalized, r);
      // Also add without GmbH, AG, LLC etc for better matching
      const withoutSuffix = normalized
        .replace(/\s+(gmbh|ag|llc|ltd|inc|sa)$/i, '')
        .trim();
      if (withoutSuffix !== normalized) {
        relocatorMap.set(withoutSuffix, r);
      }
      
      // Log preferred/partner tiers for debugging
      if (r.tier === 'preferred' || r.tier === 'partner') {
        console.log(`[FeaturedCompanies] Found ${r.tier} in DB: "${r.name}" (normalized: "${normalized}")`);
      }
    });
  }
  
  console.log(`[FeaturedCompanies] Total companies from content: ${companies.length}`);

  // Fetch review counts from google_reviews
  const { data: reviewCounts } = await supabase
    .from('google_reviews')
    .select('relocator_id');

  const reviewCountMap = new Map<string, number>();
  if (reviewCounts) {
    reviewCounts.forEach((r) => {
      const current = reviewCountMap.get(r.relocator_id) || 0;
      reviewCountMap.set(r.relocator_id, current + 1);
    });
  }

  // Map and enrich company data
  const enrichedCompanies: FeaturedCompanyData[] = companies
    .map((company) => {
      const data = company.data;
      const normalized = data.name.toLowerCase().trim();
      const withoutSuffix = normalized.replace(/\s+(gmbh|ag|llc|ltd|inc|sa)$/i, '').trim();
      
      // Try multiple lookup strategies
      let supabaseData = relocatorMap.get(normalized);
      if (!supabaseData) {
        supabaseData = relocatorMap.get(withoutSuffix);
      }

      const tier = (supabaseData?.tier as CompanyTier) || 'standard';
      
      // Log matching attempts for all companies
      if (data.name.toLowerCase().includes('prime') || data.name.toLowerCase().includes('expat')) {
        console.log(`[FeaturedCompanies] Matching "${data.name}": normalized="${normalized}", withoutSuffix="${withoutSuffix}", found=${!!supabaseData}, tier=${tier}`);
      }
      
      // Log if we found tier data
      if (supabaseData && (tier === 'preferred' || tier === 'partner')) {
        console.log(`[FeaturedCompanies] ✓ Mapped "${data.name}" → tier: ${tier}`);
      }

      return {
        id: data.id,
        slug: data.id, // Using id as slug
        name: data.name,
        logo_url: supabaseData?.logo_url || data.logo || undefined,
        tier: tier,
        rating_avg: supabaseData?.rating || data.rating?.score || undefined,
        rating_count: supabaseData
          ? reviewCountMap.get(supabaseData.id) || 0
          : data.rating?.reviews || 0,
        services: data.services || [],
        regions: data.regions || [],
      };
    })
    .filter((company) => {
      // Exclude insurance agencies (keep relocation companies only)
      const name = company.name.toLowerCase();
      return (
        !name.includes('expat savvy') &&
        !name.includes('expat services switzerland') &&
        !name.includes('swiss prime international')
      );
    });

  // Sort by tier priority, then rating
  const sortedCompanies = enrichedCompanies.sort((a, b) => {
    // Tier priority: preferred (3) > partner (2) > standard (1)
    const tierPriority = { preferred: 3, partner: 2, standard: 1 };
    const aTierValue = tierPriority[a.tier];
    const bTierValue = tierPriority[b.tier];

    if (aTierValue !== bTierValue) {
      return bTierValue - aTierValue; // Higher tier first
    }

    // Within same tier, sort by rating (higher first)
    const aRating = a.rating_avg || 0;
    const bRating = b.rating_avg || 0;
    if (aRating !== bRating) {
      return bRating - aRating;
    }

    // If ratings are equal, sort by review count
    const aCount = a.rating_count || 0;
    const bCount = b.rating_count || 0;
    return bCount - aCount;
  });

  // Apply limits per tier to ensure diversity
  const preferred = sortedCompanies
    .filter((c) => c.tier === 'preferred')
    .slice(0, 4);
  const partner = sortedCompanies.filter((c) => c.tier === 'partner').slice(0, 4);
  const standard = sortedCompanies
    .filter((c) => c.tier === 'standard')
    .slice(0, 8);

  console.log(`[FeaturedCompanies] Counts - Preferred: ${preferred.length}, Partner: ${partner.length}, Standard: ${standard.length}`);
  
  if (preferred.length > 0) {
    console.log('[FeaturedCompanies] Preferred companies:', preferred.map(c => c.name).join(', '));
  }
  if (partner.length > 0) {
    console.log('[FeaturedCompanies] Partner companies:', partner.map(c => c.name).join(', '));
  }

  // Merge and deduplicate
  const merged = [...preferred, ...partner, ...standard];
  const unique = Array.from(new Map(merged.map((c) => [c.id, c])).values());

  return unique.slice(0, limit);
}

/**
 * Get preferred companies specifically (for "See more Preferred" link)
 */
export async function getPreferredCompanies(): Promise<FeaturedCompanyData[]> {
  const allCompanies = await getFeaturedCompanies(100); // Get all
  return allCompanies.filter((c) => c.tier === 'preferred');
}


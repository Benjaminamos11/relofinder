/**
 * Featured Companies Data Utility
 * Shared logic for homepage and directory
 * Ensures consistent data source and sorting
 */

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
}

/**
 * Fetch and merge company data from Content Collections + Supabase
 * Sorted by: Preferred → Partner → Standard, then by rating
 */
export async function getFeaturedCompanies(
  limit = 10
): Promise<FeaturedCompanyData[]> {
  // Fetch ALL relocators from Supabase
  const { data: relocators, error: relocatorsError } = await supabase
    .from('relocators')
    .select('id, name, tier, rating, slug, logo, services, regions_served');

  if (relocatorsError) {
    console.error('[FeaturedCompanies] Supabase error:', relocatorsError.message, relocatorsError.hint);
  }

  if (!relocators || relocators.length === 0) {
    console.warn('[FeaturedCompanies] ⚠️ No relocators from Supabase.');
    return [];
  }

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
  const enrichedCompanies: FeaturedCompanyData[] = relocators
    .map((rel: any) => {
      const tier = (rel.tier || 'standard') as CompanyTier;

      return {
        id: rel.slug || String(rel.id),
        slug: rel.slug || String(rel.id),
        name: rel.name,
        logo_url: rel.logo || undefined,
        tier: tier,
        rating_avg: rel.rating || undefined,
        rating_count: reviewCountMap.get(rel.id) || 0,
        services: rel.services || [],
        regions: rel.regions_served || [],
      };
    })

    .filter((company) => {
      // Keep preferred/partner tier companies even if they're insurance
      // Only filter out insurance agencies if they're standard tier
      if (company.tier === 'preferred' || company.tier === 'partner') {
        return true;
      }

      // Exclude insurance agencies from standard tier only
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


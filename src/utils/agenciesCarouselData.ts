/**
 * Agencies Carousel Data Fetcher
 * Combines Content Collections + Supabase for the unified carousel
 */

import { getCollection } from 'astro:content';
import { supabase } from '../lib/supabase';

export type AgencyTier = 'preferred' | 'partner' | 'standard';

export interface AgencyReview {
  author_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  source: 'google' | 'internal';
}

export interface AgencyCarouselData {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  tier: AgencyTier;
  services: string[];
  regions: string[];
  avg_rating: number;
  reviews_count: number;
  latest_reviews: AgencyReview[]; // Changed to array
  verified: boolean;
  relocator_id?: string;
  description?: string; // Short summary
  stats?: {
    yearsInBusiness?: number;
    responseTime?: string;
  };
}

/**
 * Fetch top agencies for the carousel
 * Sorted: preferred → partner → by rating desc
 * Returns: 8 agencies with their latest review
 */
export async function getAgenciesCarouselData(limit = 8): Promise<AgencyCarouselData[]> {
  try {
    // Fetch all companies from Content Collections
    const companies = await getCollection('companies');
    
    // Fetch Supabase data (tier, rating, reviews)
    const { data: relocators, error: relocatorsError } = await supabase
      .from('relocators')
      .select('id, name, tier, rating')
      .order('tier', { ascending: true })
      .order('rating', { ascending: false });

    if (relocatorsError) {
      console.error('[AgenciesCarousel] Error fetching relocators:', relocatorsError);
    }

    // Build name-to-relocator map
    const relocatorMap = new Map();
    if (relocators) {
      relocators.forEach((rel: any) => {
        const normalizedName = rel.name.toLowerCase().trim();
        relocatorMap.set(normalizedName, rel);
      });
    }

    // Merge data
    const mergedAgencies: AgencyCarouselData[] = [];
    
    for (const company of companies) {
      const companyName = company.data.name.toLowerCase().trim();
      const relocatorData = relocatorMap.get(companyName);
      
      if (!relocatorData) continue; // Skip if not in Supabase

      // Count reviews
      const { count: reviewsCount } = await supabase
        .from('google_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('relocator_id', relocatorData.id);

      // Fetch latest 5 reviews for slider
      const { data: latestReviewsData } = await supabase
        .from('google_reviews')
        .select('author_name, rating, review_text, review_date')
        .eq('relocator_id', relocatorData.id)
        .order('review_date', { ascending: false })
        .limit(5);

      const slug = company.data.id;
      
      mergedAgencies.push({
        id: company.data.id,
        slug,
        name: company.data.name,
        logo_url: company.data.logo,
        tier: (relocatorData.tier || 'standard') as AgencyTier,
        services: company.data.services?.slice(0, 3) || [],
        regions: company.data.regions?.slice(0, 1) || [],
        avg_rating: relocatorData.rating || 0,
        reviews_count: reviewsCount || 0,
        latest_reviews: latestReviewsData ? latestReviewsData.map((r: any) => ({
          author_name: r.author_name,
          rating: r.rating,
          review_text: r.review_text,
          review_date: r.review_date,
          source: 'google' as const
        })) : [],
        verified: company.data.verified || false,
        relocator_id: relocatorData.id,
        description: company.data.description || company.body || '',
        stats: {
          yearsInBusiness: company.data.founded ? new Date().getFullYear() - company.data.founded : undefined,
          responseTime: '< 24h'
        }
      });
    }

    // Sort: Prime first, then preferred → partner → by rating
    const tierOrder = { preferred: 1, partner: 2, standard: 3 };
    mergedAgencies.sort((a, b) => {
      // Prime Relocation always first
      if (a.name.toLowerCase().includes('prime relocation')) return -1;
      if (b.name.toLowerCase().includes('prime relocation')) return 1;
      
      // Then sort by tier and rating
      const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
      if (tierDiff !== 0) return tierDiff;
      return (b.avg_rating || 0) - (a.avg_rating || 0);
    });

    console.log(`[AgenciesCarousel] Fetched ${mergedAgencies.length} agencies`);
    console.log(`[AgenciesCarousel] First agency: ${mergedAgencies[0]?.name}`);
    
    return mergedAgencies.slice(0, limit);
  } catch (error) {
    console.error('[AgenciesCarousel] Error:', error);
    return [];
  }
}


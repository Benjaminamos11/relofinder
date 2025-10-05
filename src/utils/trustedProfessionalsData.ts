import { supabase } from '../lib/supabase';

type Review = {
  author_name: string;
  rating: number;
  review_text: string;
  review_date: string;
};

type AISummary = {
  verdict: string;
  review_count: number;
};

type CompanySlide = {
  id: string;
  name: string;
  slug: string;
  tier: 'preferred' | 'partner' | 'standard';
  rating_avg: number;
  reviews: Review[];
  aiSummary: AISummary | null;
};

/**
 * Fetches companies with reviews and AI summaries for the Trusted Professionals slider
 * Prioritizes Preferred Partners, then Partners, then high-rated Standard companies
 * Returns up to 5 companies with at least 3 reviews each
 */
export async function getTrustedProfessionalsData(): Promise<CompanySlide[]> {
  try {
    // Fetch all relocators with tier and basic info
    const { data: relocators, error: relocatorsError } = await supabase
      .from('relocators')
      .select('id, name, tier, rating')
      .order('tier', { ascending: true }) // preferred < partner < standard
      .order('rating', { ascending: false });

    if (relocatorsError || !relocators) {
      console.error('[TrustedProfessionals] Error fetching relocators:', relocatorsError);
      return [];
    }

    console.log(`[TrustedProfessionals] Fetched ${relocators.length} relocators from DB`);

    // Count reviews per company from google_reviews table
    const companiesWithReviewCount = await Promise.all(
      relocators.map(async (company) => {
        const { count } = await supabase
          .from('google_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('relocator_id', company.id);
        
        return { ...company, review_count: count || 0 };
      })
    );

    // Filter companies with enough reviews (at least 3)
    const eligibleCompanies = companiesWithReviewCount.filter((r) => r.review_count >= 3);

    console.log(`[TrustedProfessionals] ${eligibleCompanies.length} companies have 3+ reviews`);

    // Prioritize: Preferred (all), Partner (all), then best Standard (top 2)
    const preferred = eligibleCompanies.filter((r) => r.tier === 'preferred');
    const partner = eligibleCompanies.filter((r) => r.tier === 'partner');
    const standard = eligibleCompanies.filter((r) => r.tier === 'standard').slice(0, 2);

    const selectedCompanies = [...preferred, ...partner, ...standard].slice(0, 5);

    console.log(
      `[TrustedProfessionals] Selected ${selectedCompanies.length} companies: ${preferred.length} preferred, ${partner.length} partner, ${standard.length} standard`
    );

    if (selectedCompanies.length === 0) {
      console.warn('[TrustedProfessionals] No eligible companies found');
      return [];
    }

    // Fetch reviews and AI summaries for each company
    const slides: CompanySlide[] = await Promise.all(
      selectedCompanies.map(async (company) => {
        // Fetch Google reviews (latest 10, we'll display 3)
        const { data: reviews, error: reviewsError } = await supabase
          .from('google_reviews')
          .select('author_name, rating, review_text, review_date')
          .eq('relocator_id', company.id)
          .order('review_date', { ascending: false })
          .limit(10);

        if (reviewsError) {
          console.error(`[TrustedProfessionals] Error fetching reviews for ${company.name}:`, reviewsError);
        }

        // Fetch AI summary from review_summaries table
        const { data: summaryData, error: summaryError } = await supabase
          .from('review_summaries')
          .select('verdict, review_count')
          .eq('relocator_id', company.id)
          .single();

        if (summaryError && summaryError.code !== 'PGRST116') {
          // PGRST116 = not found (acceptable)
          console.error(`[TrustedProfessionals] Error fetching AI summary for ${company.name}:`, summaryError);
        }

        // Generate slug from name (same logic as content collections)
        const slug = company.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim();

        return {
          id: company.id,
          name: company.name,
          slug: slug,
          tier: company.tier || 'standard',
          rating_avg: company.rating || 0,
          reviews: reviews || [],
          aiSummary: summaryData
            ? {
                verdict: summaryData.verdict,
                review_count: summaryData.review_count || (reviews?.length || 0),
              }
            : null,
        };
      })
    );

    // Filter out companies with no reviews (safety check)
    const validSlides = slides.filter((slide) => slide.reviews.length >= 3);

    console.log(`[TrustedProfessionals] Returning ${validSlides.length} valid slides`);

    return validSlides;
  } catch (error) {
    console.error('[TrustedProfessionals] Fatal error:', error);
    return [];
  }
}


/**
 * API Route: GET /api/agency/[slug]
 * Fetch complete agency profile data
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { calculateWeightedRating } from '../../../lib/ratings';
import type { 
  Agency, 
  AgencyWithRelations, 
  AgencyProfileData,
  Review,
  ExternalReviewSnapshot 
} from '../../../lib/types/agencies';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('slug', slug)
      .single();

    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch services
    const { data: services } = await supabase
      .from('agency_services')
      .select(`
        services (
          id,
          code,
          label
        )
      `)
      .eq('agency_id', agency.id);

    const agencyServices = services?.map(s => (s as any).services).filter(Boolean) || [];

    // Fetch regions
    const { data: regions } = await supabase
      .from('agency_regions')
      .select(`
        regions (
          id,
          code,
          label
        )
      `)
      .eq('agency_id', agency.id);

    const agencyRegions = regions?.map(r => (r as any).regions).filter(Boolean) || [];

    // Fetch reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        *,
        review_replies (
          id,
          author_name,
          body,
          created_at
        )
      `)
      .eq('agency_id', agency.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    const formattedReviews = (reviews || []).map(r => ({
      ...r,
      reply: (r as any).review_replies?.[0] || null,
    })) as Review[];

    // Fetch external reviews
    const { data: externalReviews } = await supabase
      .from('external_reviews')
      .select('*')
      .eq('agency_id', agency.id)
      .order('captured_at', { ascending: false });

    // Calculate rating
    const rating = calculateWeightedRating(
      formattedReviews,
      externalReviews as ExternalReviewSnapshot[] || []
    );

    // Fetch review summary
    const { data: summary } = await supabase
      .from('review_summaries')
      .select('*')
      .eq('agency_id', agency.id)
      .single();

    // Fetch alternatives (same region/service, different agency)
    const serviceIds = agencyServices.map(s => s.id);
    const regionIds = agencyRegions.map(r => r.id);

    const { data: alternativeAgencies } = await supabase
      .from('agencies')
      .select('*')
      .neq('id', agency.id)
      .limit(3);

    // TODO: Better filtering for alternatives based on shared services/regions
    const alternatives: AgencyWithRelations[] = (alternativeAgencies || []).map(a => ({
      ...a,
      services: [],
      regions: [],
    }));

    const agencyWithRelations: AgencyWithRelations = {
      ...agency,
      services: agencyServices,
      regions: agencyRegions,
    };

    const profileData: AgencyProfileData = {
      agency: agencyWithRelations,
      rating,
      reviews: formattedReviews,
      summary: summary || undefined,
      alternatives,
    };

    return new Response(JSON.stringify(profileData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in /api/agency/[slug]:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


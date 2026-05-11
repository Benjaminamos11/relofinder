export const prerender = false;
/**
 * API Route: POST /api/sync-reviews
 * Sync external reviews from Google for an agency
 */

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { syncExternalReviews } from '../../lib/serpapi';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      agency_id: string;
      place_id: string;
    };

    // Validate required fields
    if (!body.agency_id || !body.place_id) {
      return new Response(JSON.stringify({ 
        error: 'agency_id and place_id are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch reviews from Google via SerpAPI
    const result = await syncExternalReviews(body.agency_id, body.place_id);

    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: result.error || 'Failed to sync reviews' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert or update external review snapshot
    const { data, error } = await supabaseAdmin
      .from('external_reviews')
      .upsert({
        relocator_id: result.data!.agency_id,
        source: result.data!.source,
        rating: result.data!.rating,
        review_count: result.data!.review_count,
        payload: result.data!.payload,
        captured_at: new Date().toISOString(),
      }, {
        onConflict: 'relocator_id,source',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving external reviews:', error);
      return new Response(JSON.stringify({
        error: 'Failed to save reviews to database'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert individual reviews into google_reviews table
    const individualReviews = result.data!.individual_reviews;
    let reviewsInserted = 0;
    if (individualReviews.length > 0) {
      const reviewsToInsert = individualReviews.map((review: any) => ({
        relocator_id: result.data!.agency_id,
        google_review_id: review.review_id || review.link,
        author_name: review.user?.name || 'Anonymous',
        author_photo: review.user?.thumbnail || null,
        rating: review.rating || 5,
        review_text: review.snippet || review.description || '',
        review_date: review.date || review.iso_date_of_review || new Date().toISOString(),
        review_link: review.link || '',
        contributor_id: review.user?.contributor_id || null,
      }));

      const uniqueReviews = Array.from(
        new Map(reviewsToInsert.map((r: any) => [r.google_review_id, r])).values()
      );

      const { error: reviewsError } = await supabaseAdmin
        .from('google_reviews')
        .upsert(uniqueReviews, { onConflict: 'relocator_id,google_review_id' });

      if (reviewsError) {
        console.error('Error inserting individual google_reviews:', reviewsError);
      } else {
        reviewsInserted = uniqueReviews.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      snapshot: data,
      reviews_inserted: reviewsInserted,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in /api/sync-reviews:', err);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


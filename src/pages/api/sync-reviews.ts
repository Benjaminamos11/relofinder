export const prerender = false;
/**
 * API Route: POST /api/sync-reviews
 * Sync external reviews from Google for an agency
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
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
    const { data, error } = await supabase
      .from('external_reviews')
      .upsert({
        agency_id: result.data!.agency_id,
        source: result.data!.source,
        rating: result.data!.rating,
        review_count: result.data!.review_count,
        payload: result.data!.payload,
        captured_at: new Date().toISOString(),
      }, {
        onConflict: 'agency_id,source',
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

    return new Response(JSON.stringify({ 
      success: true,
      snapshot: data,
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


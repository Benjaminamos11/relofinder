/**
 * API Route: POST /api/reviews
 * Create a new review (requires auth or email verification)
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import type { Review } from '../../lib/types/agencies';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as Partial<Review> & {
      verification_token?: string;
      email?: string;
    };

    // Validate required fields
    if (!body.agency_id || !body.rating) {
      return new Response(JSON.stringify({
        error: 'Agency ID and rating are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (body.rating < 1 || body.rating > 5) {
      return new Response(JSON.stringify({
        error: 'Rating must be between 1 and 5'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check auth token from header
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // For now, allow anonymous reviews with email verification
    // TODO: Implement proper email OTP verification flow
    if (!userId && !body.email) {
      return new Response(JSON.stringify({
        error: 'Authentication or email required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        relocator_id: body.agency_id,
        user_id: userId,
        rating: body.rating,
        text: body.body || body.title || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating review:', error);
      return new Response(JSON.stringify({
        error: 'Failed to create review'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      review_id: review.id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in /api/reviews:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


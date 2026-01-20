/**
 * API Route: POST /api/replies
 * Create agency reply to review (partner/preferred tier only)
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import type { ReviewReply } from '../../lib/types/agencies';

// TODO: Move to database table or env config
const AGENCY_ADMIN_EMAILS = [
  'admin@prime-relocation.ch',
  'admin@aurisag.com',
  // Add more agency admin emails
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as Partial<ReviewReply> & {
      admin_email?: string;
    };

    // Validate required fields
    if (!body.review_id || !body.agency_id || !body.body) {
      return new Response(JSON.stringify({
        error: 'Review ID, agency ID, and reply body are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check authentication
    const authHeader = request.headers.get('Authorization');
    let userEmail: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userEmail = user?.email || null;
    }

    // Simple admin check (TODO: implement proper agency_admins table)
    if (!userEmail || !AGENCY_ADMIN_EMAILS.includes(userEmail)) {
      return new Response(JSON.stringify({
        error: 'Unauthorized: Only agency administrators can reply'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify relocator exists
    const { data: relocator } = await supabase
      .from('relocators')
      .select('id, tier, name')
      .eq('id', body.agency_id)
      .single();

    if (!relocator) {
      return new Response(JSON.stringify({
        error: 'Relocator not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['partner', 'preferred'].includes(relocator.tier)) {
      return new Response(JSON.stringify({
        error: 'Only partner and preferred relocators can reply to reviews'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify review belongs to this relocator
    const { data: review } = await supabase
      .from('reviews')
      .select('relocator_id')
      .eq('id', body.review_id)
      .single();

    if (!review || review.relocator_id !== body.agency_id) {
      return new Response(JSON.stringify({
        error: 'Review not found or does not belong to this relocator'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert reply
    const { data: reply, error } = await supabase
      .from('review_replies')
      .insert({
        review_id: body.review_id,
        relocator_id: body.agency_id,
        author_name: body.author_name || `${relocator.name} Team`,
        body: body.body,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating reply:', error);
      return new Response(JSON.stringify({
        error: 'Failed to create reply'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      reply_id: reply.id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in /api/replies:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


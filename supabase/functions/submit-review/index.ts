// Submit Review Edge Function
// Handles user-submitted reviews with validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user (if authenticated)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { relocator_id, rating, text, title, service_code, status = 'pending' } = await req.json();

    // Validation
    if (!relocator_id || !rating || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: relocator_id, rating, text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.length < 20 || text.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Review text must be between 20 and 2000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert review
    const { data, error } = await supabaseClient
      .from('reviews')
      .insert({
        relocator_id,
        user_id: user?.id || null,
        rating,
        text,
        title: title || null,
        service_code: service_code || null,
        status, // 'pending' for moderation, 'approved' if auto-approved
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting review:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit review' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trigger AI summary regeneration (async, don't wait)
    // This will be called by a cron job or manually
    console.log(`Review submitted for relocator ${relocator_id}. Consider regenerating AI summary.`);

    return new Response(JSON.stringify({ success: true, review: data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in submit-review function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


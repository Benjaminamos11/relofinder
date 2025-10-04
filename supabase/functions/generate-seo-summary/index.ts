// Generate SEO Summary Edge Function
// Creates a static, SEO-optimized summary for each agency (always visible)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEO_SYSTEM_PROMPT = `You are an SEO copywriter specializing in Swiss relocation services. Generate a short, SEO-optimized summary (3-5 sentences) based on reviews.

Requirements:
- Focus on concrete services and strengths
- Include key locations (Zürich, Geneva, Basel, etc.)
- Mention client types (corporate, families, HNWI, etc.)
- Natural language, not marketing fluff
- Include relevant keywords naturally
- Maximum 200 words

Output format (plain text only, no JSON):
Write a natural paragraph that flows well and includes key SEO terms.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { relocator_id, force = false } = await req.json();

    if (!relocator_id) {
      return new Response(
        JSON.stringify({ error: 'Missing relocator_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if SEO summary already exists (unless force=true)
    if (!force) {
      const { data: existing } = await supabaseClient
        .from('relocators')
        .select('seo_summary, seo_summary_generated_at')
        .eq('id', relocator_id)
        .single();

      if (existing?.seo_summary && existing?.seo_summary_generated_at) {
        const daysSince = (Date.now() - new Date(existing.seo_summary_generated_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 30) {
          return new Response(
            JSON.stringify({ 
              message: 'SEO summary already exists and is recent',
              seo_summary: existing.seo_summary,
              generated_at: existing.seo_summary_generated_at,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Get relocator info
    const { data: relocator, error: relocatorError } = await supabaseClient
      .from('relocators')
      .select('name, description, services, regions')
      .eq('id', relocator_id)
      .single();

    if (relocatorError || !relocator) {
      return new Response(
        JSON.stringify({ error: 'Relocator not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch reviews
    const { data: reviews } = await supabaseClient
      .from('reviews')
      .select('rating, text, service_code')
      .eq('relocator_id', relocator_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch external reviews
    const { data: externalReviews } = await supabaseClient
      .from('external_reviews')
      .select('rating, review_count')
      .eq('relocator_id', relocator_id)
      .eq('source', 'google')
      .order('captured_at', { ascending: false })
      .limit(1);

    // Prepare context
    const context = {
      name: relocator.name,
      description: relocator.description || '',
      services: relocator.services || [],
      regions: relocator.regions || [],
      review_count: (reviews?.length || 0) + (externalReviews?.[0]?.review_count || 0),
      avg_rating: externalReviews?.[0]?.rating || 4.5,
      sample_reviews: reviews?.slice(0, 5).map(r => r.text) || [],
    };

    // Call OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SEO_SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(context) },
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const seoSummary = openaiData.choices[0].message.content.trim();

    // Update relocator with SEO summary
    const { error: updateError } = await supabaseClient
      .from('relocators')
      .update({
        seo_summary: seoSummary,
        seo_summary_generated_at: new Date().toISOString(),
      })
      .eq('id', relocator_id);

    if (updateError) {
      console.error('Error updating SEO summary:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save SEO summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        seo_summary: seoSummary,
        generated_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-seo-summary function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


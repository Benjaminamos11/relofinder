// Generate AI Summary Edge Function
// Creates comprehensive AI-powered review analysis with OpenAI

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You summarize Swiss relocation agency reviews BRIEFLY and SPECIFICALLY. 
Do NOT invent pricing, guarantees, or facts not in reviews.
Prefer recent, detailed reviews. Keep output SHORT, SCANNABLE, USEFUL.

CRITICAL: Read ALL reviews word-by-word and be SPECIFIC:
- Mention consultant names (e.g., "Julie", "Sabine") if multiple reviews cite them
- Note specific outcomes (e.g., "secured apartment in 2 weeks")
- Use phrases like "Most clients mention...", "Frequently praised for..."
- If all reviews are 5-star, state that
- Extract ACTUAL short quotes from reviews

Return ONLY valid JSON matching this EXACT schema:
{
  "verdict": "1 sentence, neutral, specific (≤160 chars). Example: 'Clients frequently praise Julie and Sabine by name for securing Zug apartments before arrival'",
  "clients_like": ["≤6 words", "≤6 words", "≤6 words"],
  "watch_outs": ["≤7 words", "≤7 words"],
  "best_for": ["≤6 words", "≤6 words", "≤6 words"],
  "trend_90d": "improving" | "steady" | "mixed",
  "themes": [
    {"label": "Named Consultant Service", "strength": "high"},
    {"label": "Market Navigation", "strength": "high"},
    {"label": "Family Support", "strength": "medium"}
  ],
  "quotes": [
    {"text": "≤120 chars, actual quote from review", "source": "Google", "date": "2025-02"}
  ],
  "consultantsMentioned": ["Sabine de Potter", "Julie Poirier", "Heike"]
}

Writing rules:
✅ GOOD: "Julie and Sabine praised for pre-arrival apartment securing"
❌ BAD: "Good communication"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { relocator_id } = await req.json();

    if (!relocator_id) {
      return new Response(
        JSON.stringify({ error: 'Missing relocator_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch ONLY Google reviews from external_reviews (we know these exist)
    console.log(`Fetching Google reviews for relocator_id: ${relocator_id}`);
    
    const { data: externalReviews, error: externalError } = await supabaseClient
      .from('external_reviews')
      .select('rating, review_count, payload')
      .eq('relocator_id', relocator_id)
      .eq('source', 'google')
      .order('captured_at', { ascending: false })
      .limit(1)
      .single();

    if (externalError || !externalReviews) {
      console.error('Error fetching Google reviews:', externalError);
      return new Response(
        JSON.stringify({ 
          error: 'No Google reviews found', 
          details: externalError?.message || 'No data',
          relocator_id
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract Google reviews from payload
    console.log('Extracting reviews from payload...');
    const googleReviewsFull = externalReviews.payload?.user_reviews?.most_relevant || [];
    
    if (googleReviewsFull.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No reviews in payload',
          message: 'Google data exists but no review text found'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${googleReviewsFull.length} Google reviews in payload`);

    // Use ONLY Google reviews for analysis (no internal reviews)
    const internalCount = 0;
    const internalAvg = 0;
    const externalCount = externalReviews.review_count || 0;
    const externalAvg = externalReviews.rating || 0;
    const weightedRating = externalAvg;

    console.log(`Stats: internal=0, external=${externalCount}, total=${externalCount}, rating=${weightedRating}`);

    // Prepare Google review snippets for AI analysis
    const snippets = googleReviewsFull.slice(0, 20).map((review: any) => ({
      author: review.username || 'Anonymous',
      source: 'Google',
      date: review.date || '2025',
      rating: review.rating || 5,
      sentiment: (review.rating || 5) >= 4 ? 'pos' : ((review.rating || 5) >= 3 ? 'mix' : 'neg'),
      text: review.description || ''
    }));
    
    console.log(`Prepared ${snippets.length} Google review snippets for AI analysis`);
    
    const userPrompt = `AGENCY: Prime Relocation
COUNTS: internal=${internalCount}, external=${externalCount}, total=${internalCount + externalCount}
RECENT_90D: ${snippets.length}
SNIPPETS (normalized, anonymized):
${JSON.stringify(snippets, null, 2)}

TASKS:
1) Produce a 1-sentence verdict (≤160 chars). Be specific about consultant names and outcomes.
2) 3 bullets "clients_like" (max 6 words each)
3) 2 bullets "watch_outs" (max 7 words each)
4) 2-3 bullets "best_for" (max 6 words each)
5) Classify 90-day trend as "improving", "steady", or "mixed"
6) Top 3 themes with strength (low/med/high)
7) 1-2 short quotes (≤120 chars, no PII)
8) List consultant names mentioned
9) Confidence: high (if >20 reviews), medium (5-20), or low (<5)

Return JSON using the exact schema from system prompt.`;

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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });
    
    console.log(`OpenAI request sent for ${snippets.length} reviews, waiting for response...`);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiSummary = JSON.parse(openaiData.choices[0].message.content);
    
    console.log('AI Verdict:', aiSummary.verdict?.substring(0, 80));
    console.log('Consultants mentioned:', aiSummary.consultantsMentioned);
    console.log('Themes count:', aiSummary.themes?.length);

    // Validate AI response (check for verdict)
    if (!aiSummary.verdict) {
      console.error('Invalid AI response format:', aiSummary);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response - missing verdict' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate confidence based on review count
    const totalCount = internalCount + externalCount;
    const confidence = totalCount > 20 ? 'high' : (totalCount >= 5 ? 'medium' : 'low');
    
    // Add metadata to response
    const compactSummary = {
      as_of: new Date().toISOString(),
      counts: {
        internal: internalCount,
        external: externalCount,
        total: totalCount
      },
      confidence: confidence,
      ...aiSummary
    };

    // Upsert to review_summaries table
    const { data: summaryData, error: upsertError } = await supabaseClient
      .from('review_summaries')
      .upsert({
        relocator_id,
        summary: aiSummary.summary,
        positives: aiSummary.positives,
        negatives: aiSummary.negatives,
        themes: aiSummary.themes || {},
        internal_review_count: internalCount,
        external_review_count: externalCount,
        weighted_rating: weightedRating,
        last_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting summary:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, ...compactSummary }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-ai-summary function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


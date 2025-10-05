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

    // Fetch Google reviews from google_reviews table, ordered by date (newest first)
    console.log(`Fetching Google reviews for relocator_id: ${relocator_id}`);
    
    const { data: googleReviews, error: googleError } = await supabaseClient
      .from('google_reviews')
      .select('author_name, rating, review_text, review_date')
      .eq('relocator_id', relocator_id)
      .order('created_at', { ascending: false }); // Order by creation date (newest first)

    if (googleError || !googleReviews || googleReviews.length === 0) {
      console.error('Error fetching Google reviews:', googleError);
      return new Response(
        JSON.stringify({ 
          error: 'No Google reviews found', 
          details: googleError?.message || 'No data',
          relocator_id
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${googleReviews.length} Google reviews`);

    // Calculate aggregates from individual reviews
    const totalRating = googleReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / googleReviews.length;
    const externalCount = googleReviews.length;
    const internalCount = 0; // No internal reviews for now
    const externalAvg = Math.round(avgRating * 100) / 100;
    const weightedRating = externalAvg;

    console.log(`Stats: internal=${internalCount}, external=${externalCount}, total=${externalCount}, rating=${weightedRating}`);

    // Prepare Google review snippets for AI analysis (prioritize recent reviews)
    const recentReviews = googleReviews.slice(0, 30); // Take top 30 most recent
    const olderReviews = googleReviews.slice(30, 50); // Take some older ones for context
    
    const snippets = [
      // Recent reviews (higher weight)
      ...recentReviews.map((review: any, index: number) => ({
        author: review.author_name || 'Anonymous',
        source: 'Google',
        date: review.review_date || '2025',
        rating: review.rating || 5,
        sentiment: (review.rating || 5) >= 4 ? 'pos' : ((review.rating || 5) >= 3 ? 'mix' : 'neg'),
        text: review.review_text || '',
        weight: 'recent', // Mark as recent
        recency_score: Math.max(0, 30 - index) // Higher score for newer reviews
      })),
      // Older reviews (lower weight)
      ...olderReviews.map((review: any) => ({
        author: review.author_name || 'Anonymous',
        source: 'Google',
        date: review.review_date || '2025',
        rating: review.rating || 5,
        sentiment: (review.rating || 5) >= 4 ? 'pos' : ((review.rating || 5) >= 3 ? 'mix' : 'neg'),
        text: review.review_text || '',
        weight: 'older', // Mark as older
        recency_score: 1 // Lower score for older reviews
      }))
    ];
    
    console.log(`Prepared ${snippets.length} Google review snippets (${recentReviews.length} recent, ${olderReviews.length} older) for AI analysis`);
    
    const userPrompt = `AGENCY: Prime Relocation
COUNTS: internal=${internalCount}, external=${externalCount}, total=${internalCount + externalCount}
RECENT_REVIEWS: ${recentReviews.length} (weighted higher)
TOTAL_REVIEWS: ${snippets.length}
SNIPPETS (recent reviews weighted higher, normalized, anonymized):
${JSON.stringify(snippets, null, 2)}

CRITICAL: Prioritize reviews marked as "recent" (weight: recent) over "older" ones. Recent reviews reflect current service quality.

TASKS:
1) Produce a 1-sentence verdict (≤160 chars). Focus on recent trends and consultant names.
2) 3 bullets "clients_like" (max 6 words each) - emphasize recent patterns
3) 2 bullets "watch_outs" (max 7 words each) - note any recent concerns
4) 2-3 bullets "best_for" (max 6 words each) - based on recent reviews
5) Classify trend as "improving" (if recent reviews are better), "steady", or "declining"
6) Top 3 themes with strength (focus on recent patterns)
7) 1-2 short quotes (≤120 chars, prefer recent reviews)
8) List consultant names mentioned in recent reviews
9) Confidence: high (if >30 recent reviews), medium (10-30), or low (<10)

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
    let aiContent = openaiData.choices[0].message.content;
    
    // Clean up the response (remove markdown code blocks if present)
    if (aiContent.includes('```json')) {
      aiContent = aiContent.split('```json')[1].split('```')[0];
    } else if (aiContent.includes('```')) {
      aiContent = aiContent.split('```')[1].split('```')[0];
    }
    
    const aiSummary = JSON.parse(aiContent.trim());
    
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


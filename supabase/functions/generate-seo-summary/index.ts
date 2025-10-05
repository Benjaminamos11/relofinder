import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log(`Generating SEO summary for relocator_id: ${relocator_id}`);

    // Fetch relocator data
    const { data: relocator, error: relocatorError } = await supabaseClient
      .from('relocators')
      .select('*')
      .eq('id', relocator_id)
      .single();

    if (relocatorError || !relocator) {
      console.error('Error fetching relocator:', relocatorError);
      return new Response(
        JSON.stringify({ error: 'Relocator not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch review summary
    const { data: reviewSummary } = await supabaseClient
      .from('review_summaries')
      .select('*')
      .eq('relocator_id', relocator_id)
      .single();

    // Fetch Google reviews for aggregate stats
    const { data: googleReviews } = await supabaseClient
      .from('google_reviews')
      .select('rating')
      .eq('relocator_id', relocator_id);

    // Calculate rating and count
    let averageRating = 0;
    let reviewCount = 0;
    if (googleReviews && googleReviews.length > 0) {
      const totalRating = googleReviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = parseFloat((totalRating / googleReviews.length).toFixed(1));
      reviewCount = googleReviews.length;
    }

    // Extract common positives and negatives from review summary
    let positives = 'responsive service, local expertise';
    let negatives = 'limited availability during peak times';
    let reviewSummaryText = '';

    if (reviewSummary) {
      if (reviewSummary.positives && Array.isArray(reviewSummary.positives)) {
        positives = reviewSummary.positives.slice(0, 3).join(', ');
      }
      if (reviewSummary.negatives && Array.isArray(reviewSummary.negatives)) {
        negatives = reviewSummary.negatives.slice(0, 2).join(', ');
      }
      if (reviewSummary.summary) {
        reviewSummaryText = reviewSummary.summary;
      }
    }

    // Extract regions and services
    const regionsServed = Array.isArray(relocator.regions_served) 
      ? relocator.regions_served.join(', ') 
      : 'Zurich, Geneva, Basel';
    
    const topRegion = Array.isArray(relocator.regions_served) && relocator.regions_served.length > 0
      ? relocator.regions_served[0]
      : 'Zurich';

    // Determine company type based on name and bio
    let companyType = 'relocation services';
    let serviceKeywords = 'relocation services';
    let targetAudience = 'expats relocating to Switzerland';
    
    if (relocator.name.toLowerCase().includes('expat savvy') || 
        relocator.bio?.toLowerCase().includes('insurance') ||
        relocator.bio?.toLowerCase().includes('financial services')) {
      companyType = 'insurance and financial services';
      serviceKeywords = 'health insurance, financial planning';
      targetAudience = 'expats seeking insurance and financial advice';
    } else if (relocator.name.toLowerCase().includes('swiss prime') ||
               relocator.bio?.toLowerCase().includes('wealth management') ||
               relocator.bio?.toLowerCase().includes('investment')) {
      companyType = 'financial advisory and wealth management';
      serviceKeywords = 'wealth management, financial planning';
      targetAudience = 'high-net-worth expats and investors';
    } else if (relocator.bio?.toLowerCase().includes('moving') ||
               relocator.bio?.toLowerCase().includes('déménagement')) {
      companyType = 'moving and relocation services';
      serviceKeywords = 'moving services, relocation support';
      targetAudience = 'expats relocating to Switzerland';
    }

    // Build the prompt
    const systemPrompt = `You are an expert SEO & expat services analyst. 
You write short, factual, keyword-optimized summaries for expat service providers in Switzerland.
Your output appears directly under the company hero on ReloFinder.ch.
It must sound trustworthy, objective, and helpful to expats comparing service providers.
Keep it concise (80–120 words) and factually grounded in the provided data.`;

    const userPrompt = `Write a one-paragraph summary for the company below.

### Company Information
Name: ${relocator.name}
Type: ${companyType}
Tier: ${relocator.tier || 'standard'}
Founded: ${relocator.founded || 'Not specified'}
Languages: ${Array.isArray(relocator.languages) ? relocator.languages.join(', ') : 'English, German'}
Regions served: ${regionsServed}
Certifications: ${relocator.certifications || 'Not specified'}
Website: ${relocator.website || 'Not specified'}
Bio: ${relocator.bio || 'Not specified'}

### Reviews Summary
Overall rating: ${averageRating} / 5 (${reviewCount} reviews)
Common positives: ${positives}
Common negatives: ${negatives}
AI Review Summary: ${reviewSummaryText}

### SEO Target
Target keyword phrase: "${relocator.name} ${serviceKeywords} Switzerland"
Secondary intent: "expat ${serviceKeywords} in ${topRegion}", "${companyType} ${topRegion}"

### Instructions
- Include the company name naturally at least twice.
- Mention 1–2 service categories and 1 region keyword.
- Blend review insights ("clients praise...") into a factual tone.
- Avoid superlatives like "best"; prefer "known for," "trusted by," or "recognized."
- End with a neutral statement about who it's ideal for ("ideal for ${targetAudience}").

Output:
Return only the plain paragraph text. No lists, no markdown.`;

    console.log('Calling OpenAI for SEO summary generation...');

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const seoSummary = openaiData.choices[0].message.content.trim();

    console.log('SEO summary generated:', seoSummary.substring(0, 100) + '...');

    // Store the summary in the database
    const { data: updatedRelocator, error: updateError } = await supabaseClient
      .from('relocators')
      .update({
        seo_summary: seoSummary,
        seo_summary_generated_at: new Date().toISOString(),
      })
      .eq('id', relocator_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating relocator with SEO summary:', updateError);
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({
        summary: seoSummary,
        generated_at: new Date().toISOString(),
        word_count: seoSummary.split(' ').length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-seo-summary function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

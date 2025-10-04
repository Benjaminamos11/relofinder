// Sync Google Reviews Edge Function
// Cron job to periodically fetch new reviews from SerpAPI

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

    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    if (!serpApiKey) {
      return new Response(
        JSON.stringify({ error: 'SerpAPI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all relocators with Google Place IDs
    const { data: relocators, error: relocatorsError } = await supabaseClient
      .from('relocators')
      .select('id, name, google_place_id, google_maps_url')
      .not('google_place_id', 'is', null);

    if (relocatorsError) {
      console.error('Error fetching relocators:', relocatorsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch relocators' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!relocators || relocators.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No relocators with Google Place IDs found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Fetch reviews for each relocator
    for (const relocator of relocators) {
      try {
        console.log(`Fetching reviews for ${relocator.name}...`);

        // Check last sync time (don't sync more than once per 10 days)
        const { data: lastSync } = await supabaseClient
          .from('external_reviews')
          .select('captured_at')
          .eq('relocator_id', relocator.id)
          .eq('source', 'google')
          .order('captured_at', { ascending: false })
          .limit(1)
          .single();

        if (lastSync) {
          const daysSinceLastSync = (Date.now() - new Date(lastSync.captured_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceLastSync < 10) {
            console.log(`Skipping ${relocator.name} - last synced ${Math.round(daysSinceLastSync)} days ago`);
            results.push({
              relocator_id: relocator.id,
              name: relocator.name,
              status: 'skipped',
              reason: 'synced_recently',
            });
            continue;
          }
        }

        // Fetch from SerpAPI
        const placeId = relocator.google_place_id || relocator.name;
        
        // Determine the correct search query
        let searchQuery: string;
        
        if (placeId.startsWith('ChIJ') || placeId.match(/^[A-Za-z0-9_-]{27}$/)) {
          // It's a valid Place ID - use it directly as search query
          // SerpAPI will recognize it and use it for place lookup
          searchQuery = placeId;
        } else if (placeId.includes('google.com/maps/place/')) {
          // Extract business name from URL
          const nameMatch = placeId.match(/\/place\/([^/@]+)/);
          if (nameMatch) {
            // Decode URL-encoded name and add Switzerland for better results
            searchQuery = decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) + ' Switzerland';
          } else {
            searchQuery = relocator.name + ' Switzerland';
          }
        } else {
          // Use as-is (text search or business name)
          searchQuery = placeId;
        }
        
        // Always use search endpoint - it's more reliable and works with Place IDs too
        const serpApiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(searchQuery)}&type=search&api_key=${serpApiKey}&hl=en&gl=ch`;

        const response = await fetch(serpApiUrl);
        
        if (!response.ok) {
          throw new Error(`SerpAPI request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(`SerpAPI error: ${data.error}`);
        }

        // Handle different response structures
        let businessData = null;

        if (data.place_results) {
          // Direct place lookup response
          businessData = data.place_results;
        } else if (data.local_results && data.local_results.length > 0) {
          // Search results - find the first result with reviews
          for (const result of data.local_results) {
            if (result.reviews && result.reviews > 0) {
              businessData = result;
              break;
            }
          }
        }

        if (!businessData || !businessData.rating) {
          console.log(`No reviews found for ${relocator.name}`);
          results.push({
            relocator_id: relocator.id,
            name: relocator.name,
            status: 'no_reviews',
          });
          continue;
        }

        // Insert external review snapshot
        const { error: insertError } = await supabaseClient
          .from('external_reviews')
          .insert({
            relocator_id: relocator.id,
            source: 'google',
            rating: businessData.rating || 0,
            review_count: businessData.reviews || 0,
            payload: businessData,
            captured_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Error inserting review for ${relocator.name}:`, insertError);
          results.push({
            relocator_id: relocator.id,
            name: relocator.name,
            status: 'error',
            error: insertError.message,
          });
          continue;
        }

        console.log(`✓ Synced ${businessData.reviews} reviews for ${relocator.name} (${businessData.rating}★)`);
        results.push({
          relocator_id: relocator.id,
          name: relocator.name,
          status: 'success',
          rating: businessData.rating,
          review_count: businessData.reviews,
        });

        // Rate limiting: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing ${relocator.name}:`, error);
        results.push({
          relocator_id: relocator.id,
          name: relocator.name,
          status: 'error',
          error: error.message,
        });
      }
    }

    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: relocators.length,
          synced: successCount,
          errors: errorCount,
          skipped: skippedCount,
        },
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync-google-reviews function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


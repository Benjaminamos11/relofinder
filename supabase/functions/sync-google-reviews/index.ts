// Sync Google Reviews Edge Function
// Cron job to periodically fetch new reviews from SerpAPI

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// A Google Maps data_id (`0x…:0x…`) pins one specific business listing. It is
// what the reviews endpoint actually consumes, and it can be lifted straight out
// of a share/maps URL.
const DATA_ID_RE = /(0x[0-9a-f]+:0x[0-9a-f]+)/i;
// A Place ID: either the ChIJ… form or the 27-char opaque form.
const PLACE_ID_RE = /^(ChIJ[A-Za-z0-9_-]+|[A-Za-z0-9_-]{27})$/;

/**
 * Resolve a PINNED Google identifier for an agency, or null.
 *
 * A business name is not an identifier. Searching Google Maps for one returns
 * whatever ranks — which is how 161 reviews from Reloswiss RM (Gossau) and
 * Xpress Relocations (Miami, FL) ended up filed under Rel-Ex, whose
 * google_place_id held the literal text 'Rel-Ex Relocation Switzerland'.
 * An agency without a pinned identifier is skipped, never guessed at.
 */
function resolveGoogleIdentifier(
  placeId: string | null,
  mapsUrl: string | null
): { kind: 'data_id' | 'place_id'; value: string } | null {
  for (const raw of [placeId, mapsUrl]) {
    if (!raw || typeof raw !== 'string') continue;
    const value = raw.trim();
    if (!value) continue;

    const dataId = value.match(DATA_ID_RE);
    if (dataId) return { kind: 'data_id', value: dataId[1] };

    if (PLACE_ID_RE.test(value)) return { kind: 'place_id', value };
  }
  return null;
}

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

    // Any relocator carrying something we might pin a listing to. Whether it
    // actually resolves is decided per agency by resolveGoogleIdentifier().
    const { data: relocators, error: relocatorsError } = await supabaseClient
      .from('relocators')
      .select('id, name, google_place_id, google_maps_url')
      .or('google_place_id.not.is.null,google_maps_url.not.is.null');

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

        // Resolve a pinned identifier. No identifier → skip. We never fall back
        // to a name search: that is what mis-attributed foreign businesses.
        const identifier = resolveGoogleIdentifier(relocator.google_place_id, relocator.google_maps_url);

        if (!identifier) {
          console.warn(
            `Skipping ${relocator.name}: google_place_id/google_maps_url hold no Place ID or data_id ` +
              `(got ${JSON.stringify(relocator.google_place_id)}). Paste the business's Google Maps ` +
              `share URL into google_maps_url to enable syncing.`
          );
          results.push({
            relocator_id: relocator.id,
            name: relocator.name,
            status: 'unpinned_identifier',
          });
          continue;
        }

        let businessData = null;
        let dataId: string | null = null;

        if (identifier.kind === 'data_id') {
          // Already pinned to one listing — no search, so no chance of matching
          // a different business.
          dataId = identifier.value;
        } else {
          const serpApiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(identifier.value)}&type=search&api_key=${serpApiKey}&hl=en&gl=ch`;

          const response = await fetch(serpApiUrl);

          if (!response.ok) {
            throw new Error(`SerpAPI request failed: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(`SerpAPI error: ${data.error}`);
          }

          // Only a direct place lookup is trustworthy here. local_results is a
          // ranked search list: taking "the first result with reviews" from it
          // is the guess that caused the mis-attribution.
          businessData = data.place_results ?? null;

          if (!businessData || !businessData.data_id) {
            console.log(`Place ID ${identifier.value} did not resolve to a listing for ${relocator.name}`);
            results.push({
              relocator_id: relocator.id,
              name: relocator.name,
              status: 'unresolved_place_id',
            });
            continue;
          }

          dataId = businessData.data_id;
        }

        // Now fetch ALL individual reviews with pagination
        let allReviews = [];
        let nextPageToken = null;
        let page = 1;
        const maxPages = 10; // Limit to 10 pages (10 reviews each = up to 100 reviews)

        do {
          console.log(`Fetching reviews page ${page} for ${relocator.name}...`);
          
          let reviewsUrl = `https://serpapi.com/search?engine=google_maps_reviews&data_id=${encodeURIComponent(dataId)}&api_key=${serpApiKey}&hl=en`;
          if (nextPageToken) {
            reviewsUrl += `&next_page_token=${encodeURIComponent(nextPageToken)}`;
          }

          const reviewsResponse = await fetch(reviewsUrl);
          if (!reviewsResponse.ok) {
            console.error(`Failed to fetch reviews page ${page}: ${reviewsResponse.status}`);
            break;
          }

          const reviewsData = await reviewsResponse.json();
          
          if (reviewsData.error) {
            console.error(`SerpAPI reviews error: ${reviewsData.error}`);
            break;
          }

          // The reviews endpoint reports the listing it actually served, so the
          // first page is where we learn which business we pinned.
          if (!businessData && reviewsData.place_info) {
            businessData = reviewsData.place_info;
          }

          if (reviewsData.reviews && reviewsData.reviews.length > 0) {
            allReviews = allReviews.concat(reviewsData.reviews);
            console.log(`Got ${reviewsData.reviews.length} reviews on page ${page}`);
          }

          nextPageToken = reviewsData.serpapi_pagination?.next_page_token;
          page++;

          // Rate limiting between page requests
          if (nextPageToken) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } while (nextPageToken && page <= maxPages);

        console.log(`Total reviews fetched: ${allReviews.length} for ${relocator.name}`);

        // Aggregate snapshot for the listing we pinned.
        if (businessData) {
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
          }
        }

        // Store individual reviews in google_reviews table
        if (allReviews.length > 0) {
          const reviewsToInsert = allReviews.map(review => ({
            relocator_id: relocator.id,
            google_review_id: review.review_id || review.link,
            author_name: review.user?.name || 'Anonymous',
            author_photo: review.user?.thumbnail || null,
            rating: review.rating || 5,
            review_text: review.snippet || review.description || '',
            review_date: review.date || review.iso_date_of_review || new Date().toISOString(),
            review_link: review.link || '',
            contributor_id: review.user?.contributor_id || null,
          }));

          // Deduplicate reviews by google_review_id before inserting
          const uniqueReviews = Array.from(
            new Map(reviewsToInsert.map(r => [r.google_review_id, r])).values()
          );

          console.log(`Deduped ${reviewsToInsert.length} reviews to ${uniqueReviews.length} unique reviews`);

          const { error: reviewsInsertError } = await supabaseClient
            .from('google_reviews')
            .upsert(uniqueReviews, { onConflict: 'relocator_id,google_review_id' });

          if (reviewsInsertError) {
            console.error(`Error inserting individual reviews for ${relocator.name}:`, reviewsInsertError);
          } else {
            console.log(`✓ Stored ${uniqueReviews.length} individual reviews for ${relocator.name}`);
          }

          // Hand-seeded rows (google_review_id 'manual-…') exist only to carry a
          // listing until its first real sync. Once that lands they are the same
          // reviews under a different id, so drop them rather than double-count.
          const { error: seedError } = await supabaseClient
            .from('google_reviews')
            .delete()
            .eq('relocator_id', relocator.id)
            .like('google_review_id', 'manual-%');

          if (seedError) {
            console.error(`Error clearing manual seed reviews for ${relocator.name}:`, seedError);
          }
        }

        console.log(`✓ Synced ${businessData?.reviews ?? allReviews.length} reviews for ${relocator.name} (${businessData?.rating ?? 'n/a'}★)`);
        results.push({
          relocator_id: relocator.id,
          name: relocator.name,
          status: 'success',
          rating: businessData?.rating ?? null,
          review_count: businessData?.reviews ?? allReviews.length,
          individual_reviews_stored: allReviews.length,
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


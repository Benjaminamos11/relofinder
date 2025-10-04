/**
 * SerpAPI Integration for Google Reviews
 * Fetches external reviews for agencies
 */

const SERPAPI_KEY = import.meta.env.SERPAPI_KEY || '';

interface GoogleReviewsParams {
  place_id: string;
  reviews_limit?: number;
}

interface GoogleReviewsResponse {
  place_results?: {
    rating?: number;
    reviews?: number;
    reviews_results?: Array<{
      rating: number;
      date: string;
      snippet: string;
      user: {
        name: string;
      };
    }>;
  };
  error?: string;
}

/**
 * Fetch Google reviews for a place
 */
export async function fetchGoogleReviews(params: GoogleReviewsParams): Promise<GoogleReviewsResponse> {
  if (!SERPAPI_KEY) {
    console.warn('SERPAPI_KEY not configured');
    return { error: 'API key not configured' };
  }

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_maps_reviews');
  url.searchParams.set('place_id', params.place_id);
  url.searchParams.set('api_key', SERPAPI_KEY);
  
  if (params.reviews_limit) {
    url.searchParams.set('num', String(params.reviews_limit));
  }

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`SerpAPI error: ${response.status} ${response.statusText}`);
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return { error: 'Failed to fetch reviews' };
  }
}

/**
 * Get Google Maps place info
 */
export async function getPlaceInfo(place_id: string) {
  if (!SERPAPI_KEY) {
    console.warn('SERPAPI_KEY not configured');
    return null;
  }

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_maps');
  url.searchParams.set('q', '');
  url.searchParams.set('place_id', place_id);
  url.searchParams.set('api_key', SERPAPI_KEY);

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`SerpAPI error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching place info:', error);
    return null;
  }
}

/**
 * Sync external reviews to database
 * Run this periodically (cron job) to update Google review snapshots
 */
export async function syncExternalReviews(agencyId: string, placeId: string) {
  const reviews = await fetchGoogleReviews({ place_id: placeId });
  
  if (reviews.error || !reviews.place_results) {
    return { success: false, error: reviews.error };
  }

  const { rating, reviews: review_count } = reviews.place_results;

  if (!rating || !review_count) {
    return { success: false, error: 'No review data available' };
  }

  // Note: You would insert this into the external_reviews table here
  // For now, return the data
  return {
    success: true,
    data: {
      agency_id: agencyId,
      source: 'google',
      rating,
      review_count,
      payload: reviews.place_results,
    },
  };
}


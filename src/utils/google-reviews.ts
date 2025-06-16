import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (only if environment variables are available)
let supabase: any = null;
if (typeof window === 'undefined') { // Server-side only
  try {
    if (import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_ANON_KEY) {
      supabase = createClient(
        import.meta.env.SUPABASE_URL,
        import.meta.env.SUPABASE_ANON_KEY
      );
    }
  } catch (error) {
    console.log('Supabase not available:', error);
  }
}

interface GoogleReview {
  position: number;
  author: {
    name: string;
    link?: string;
    thumbnail?: string;
    reviews?: number;
    local_guide?: boolean;
  };
  rating: number;
  date: string;
  snippet: string;
  likes?: number;
  images?: string[];
  response?: {
    date: string;
    snippet: string;
  };
}

interface GoogleBusinessInfo {
  place_id: string;
  data_id: string;
  data_cid: string;
  reviews_link: string;
  reviews_id: string;
  reviews_rating: number;
  reviews_count: number;
  photos_count: number;
  about?: any;
  address: string;
  hours?: any;
  popular_times?: any;
  reviews: GoogleReview[];
}

interface SerpApiResponse {
  search_metadata: any;
  search_parameters: any;
  search_information: any;
  place_results: GoogleBusinessInfo;
}

export interface FormattedReview {
  author: string;
  rating: number;
  text: string;
  date?: string;
  source: string;
}

export interface BusinessReviewData {
  rating: number;
  reviewCount: number;
  reviews: FormattedReview[];
  businessInfo: {
    address: string;
    placeId: string;
  };
}

export interface RawGoogleReview {
  author: {
    name: string;
  };
  rating: number;
  text: string;
  time_description: string;
}

/**
 * Fetches Google My Business reviews using SerpAPI
 * @param googleMyBusinessUrl - The Google Maps URL or business search query
 * @param apiKey - SerpAPI key
 * @returns Promise<BusinessReviewData>
 */
export async function fetchGoogleReviews(
  googleMyBusinessUrl: string, 
  apiKey: string
): Promise<BusinessReviewData | null> {
  try {
    console.log('Fetching reviews from SerpAPI:', googleMyBusinessUrl);
    
    // Extract place ID or search query from URL
    let searchQuery = '';
    
    if (googleMyBusinessUrl.includes('place/')) {
      // Extract business name from place URL
      const placeName = googleMyBusinessUrl.split('place/')[1]?.split('/')[0];
      searchQuery = decodeURIComponent(placeName || '').replace(/\+/g, ' ');
    } else if (googleMyBusinessUrl.includes('q=')) {
      // Direct search query
      searchQuery = googleMyBusinessUrl.split('q=')[1]?.split('&')[0];
      searchQuery = decodeURIComponent(searchQuery || '').replace(/\+/g, ' ');
    } else {
      // Use the URL as-is
      searchQuery = googleMyBusinessUrl;
    }

    const serpApiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(searchQuery)}&type=search&api_key=${apiKey}&hl=en&gl=ch`;
    
    const response = await fetch(serpApiUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    // Find the first local result with reviews
    const localResults = data.local_results || [];
    let businessData = null;
    
    for (const result of localResults) {
      if (result.reviews && result.reviews.length > 0) {
        businessData = result;
        break;
      }
    }

    if (!businessData) {
      console.log('No reviews found in SerpAPI response');
      return null;
    }

    // Format the reviews
    const formattedReviews: FormattedReview[] = businessData.reviews.map((review: RawGoogleReview) => ({
      author: review.author?.name || 'Anonymous',
      rating: review.rating || 5,
      text: review.text || '',
      date: review.time_description || '',
      source: 'google'
    }));

    const reviewData: BusinessReviewData = {
      rating: businessData.rating || 4.5,
      reviewCount: businessData.reviews_original || businessData.reviews.length,
      reviews: formattedReviews,
      businessInfo: {
        address: businessData.address || '',
        placeId: businessData.place_id || ''
      }
    };

    // Save reviews to Supabase if available
    if (supabase && formattedReviews.length > 0) {
      await saveReviewsToSupabase(searchQuery, formattedReviews);
    }

    return reviewData;
    
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return null;
  }
}

async function saveReviewsToSupabase(companyId: string, reviews: FormattedReview[]) {
  if (!supabase) return;

  try {
    // Convert company name to ID format
    const cleanCompanyId = companyId.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Check which reviews we already have
    const { data: existingReviews } = await supabase
      .from('company_reviews')
      .select('author, text')
      .eq('company_id', cleanCompanyId);

    const existingSet = new Set(
      existingReviews?.map((r: any) => `${r.author}-${r.text.substring(0, 50)}`) || []
    );

    // Filter out duplicates and prepare for insert
    const newReviews = reviews
      .filter(review => {
        const key = `${review.author}-${review.text.substring(0, 50)}`;
        return !existingSet.has(key);
      })
      .map(review => ({
        company_id: cleanCompanyId,
        author: review.author,
        rating: review.rating,
        text: review.text,
        date: review.date ? new Date(review.date).toISOString() : new Date().toISOString(),
        source: review.source,
        fetched_at: new Date().toISOString()
      }));

    if (newReviews.length > 0) {
      const { error } = await supabase
        .from('company_reviews')
        .insert(newReviews);

      if (error) {
        console.error('Error saving reviews to Supabase:', error);
      } else {
        console.log(`Saved ${newReviews.length} new reviews to Supabase for ${cleanCompanyId}`);
      }
    }
  } catch (error) {
    console.error('Error in saveReviewsToSupabase:', error);
  }
}

/**
 * Extract search query from Google Maps URL or return as-is if it's already a search query
 */
function extractSearchQuery(input: string): string | null {
  try {
    // If it doesn't look like a URL, treat it as a search query
    if (!input.includes('http') && !input.includes('maps.google')) {
      return input;
    }

    // Handle different Google Maps URL formats
    if (input.includes('g.co/kgs/')) {
      // Short URL format - use the path as identifier
      const match = input.match(/g\.co\/kgs\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    }
    
    if (input.includes('maps.google.com')) {
      // Full Google Maps URLs
      const urlObj = new URL(input);
      
      // Check for place_id parameter
      const placeId = urlObj.searchParams.get('place_id');
      if (placeId) return placeId;
      
      // Check for data parameter (contains place info)
      const data = urlObj.searchParams.get('data');
      if (data) {
        const dataMatch = data.match(/!1s([^!]+)/);
        if (dataMatch) return dataMatch[1];
      }
      
      // Extract from path for business names
      const pathMatch = input.match(/maps\/place\/([^\/]+)/);
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]);
      }
    }
    
    return input; // Return as-is if we can't parse it
  } catch (error) {
    console.error('Error extracting search query from input:', error);
    return input; // Return as-is on error
  }
}

/**
 * Format raw Google reviews data into our standard format
 */
function formatReviews(reviews: any[]): FormattedReview[] {
  if (!Array.isArray(reviews)) {
    console.error('Reviews is not an array:', typeof reviews);
    return [];
  }

  return reviews.map((review, index) => {
    try {
      // Handle different possible review structures
      const author = review.user?.name || review.author?.name || review.name || `User ${index + 1}`;
      const rating = review.rating || review.stars || 5;
      const text = review.text || review.snippet || review.comment || '';
      const date = review.date || review.time || review.relative_date || 'Recently';
      
      // Handle author info
      const authorInfo = review.user || review.author || {};
      const verified = authorInfo.local_guide || authorInfo.verified || false;
      const avatar = authorInfo.thumbnail || authorInfo.avatar || undefined;
      
      return {
        author,
        rating,
        date: formatReviewDate(date),
        text,
        source: 'google',
        verified,
        avatar,
        likes: review.likes || 0,
        response: review.response ? {
          date: formatReviewDate(review.response.date || review.response.time || ''),
          text: review.response.text || review.response.snippet || ''
        } : undefined
      };
    } catch (error) {
      console.error(`Error formatting review ${index}:`, error);
      console.log('Problematic review data:', review);
      
      // Return a fallback review
      return {
        author: `User ${index + 1}`,
        rating: 5,
        date: 'Recently',
        text: 'Review content unavailable',
        source: 'google',
        verified: false
      };
    }
  }).filter(review => review !== null);
}

/**
 * Format review date to a readable format
 */
function formatReviewDate(dateString: string): string {
  try {
    // Handle different date formats from Google
    if (dateString.includes('ago')) {
      return dateString; // "2 weeks ago", "1 month ago", etc.
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Fetch detailed reviews using place_id
 */
async function fetchDetailedReviews(placeId: string, apiKey: string): Promise<FormattedReview[]> {
  try {
    const serpApiUrl = new URL('https://serpapi.com/search');
    serpApiUrl.searchParams.append('engine', 'google_maps_reviews');
    serpApiUrl.searchParams.append('place_id', placeId);
    serpApiUrl.searchParams.append('api_key', apiKey);
    serpApiUrl.searchParams.append('hl', 'en');
    serpApiUrl.searchParams.append('sort_by', 'newestFirst');

    console.log('Fetching detailed reviews:', serpApiUrl.toString());

    const response = await fetch(serpApiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Detailed reviews request failed: ${response.status}`);
    }

    const data: any = await response.json();
    
    console.log('Detailed reviews response structure:', {
      topLevelKeys: Object.keys(data),
      hasReviews: !!data.reviews,
      reviewsType: typeof data.reviews,
      reviewsLength: Array.isArray(data.reviews) ? data.reviews.length : 'not array'
    });

    if (data.reviews && Array.isArray(data.reviews)) {
      return formatReviews(data.reviews);
    }

    return [];
  } catch (error) {
    console.error('Error in fetchDetailedReviews:', error);
    return [];
  }
}

/**
 * Get mock reviews data for development/fallback
 */
export function getMockReviews(): FormattedReview[] {
  return [
    {
      author: "Sarah Johnson",
      rating: 5,
      text: "Excellent service from start to finish! The team made our relocation to Switzerland seamless and stress-free.",
      date: "2 weeks ago",
      source: "google"
    },
    {
      author: "Michael Chen",
      rating: 4,
      text: "Very professional and helpful throughout the process. Would definitely recommend to other expats.",
      date: "1 month ago", 
      source: "google"
    },
    {
      author: "Emma Wilson",
      rating: 5,
      text: "Outstanding support with visa applications and housing search. Couldn't have done it without them!",
      date: "3 weeks ago",
      source: "google"
    },
    {
      author: "David Rodriguez",
      rating: 4,
      text: "Great local knowledge and connections. Made settling in much easier than expected.",
      date: "2 months ago",
      source: "google"
    },
    {
      author: "Lisa Thompson",
      rating: 5,
      text: "Professional, efficient, and genuinely caring team. They went above and beyond for our family.",
      date: "1 month ago",
      source: "google"
    }
  ];
} 
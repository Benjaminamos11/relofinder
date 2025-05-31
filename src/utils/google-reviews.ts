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
  date: string;
  text: string;
  verified: boolean;
  avatar?: string;
  likes?: number;
  response?: {
    date: string;
    text: string;
  };
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

/**
 * Fetches Google My Business reviews using SerpAPI
 * @param googleMapsUrl - The Google Maps URL or business search query
 * @param apiKey - SerpAPI key
 * @returns Promise<BusinessReviewData>
 */
export async function fetchGoogleReviews(
  googleMapsUrl: string,
  apiKey: string
): Promise<BusinessReviewData | null> {
  try {
    // Extract place data from Google Maps URL or use as search query
    const searchQuery = extractSearchQuery(googleMapsUrl);
    if (!searchQuery) {
      console.warn('Could not extract search query from:', googleMapsUrl);
      return null;
    }

    // SerpAPI endpoint for Google Maps reviews
    const serpApiUrl = new URL('https://serpapi.com/search');
    serpApiUrl.searchParams.append('engine', 'google_maps');
    serpApiUrl.searchParams.append('q', searchQuery);
    serpApiUrl.searchParams.append('type', 'search');
    serpApiUrl.searchParams.append('api_key', apiKey);
    serpApiUrl.searchParams.append('hl', 'en'); // Language
    serpApiUrl.searchParams.append('gl', 'ch'); // Country (Switzerland)

    console.log('Fetching reviews from SerpAPI:', serpApiUrl.toString());

    const response = await fetch(serpApiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    
    // Debug: Log the full response structure
    console.log('SerpAPI Response Structure:', {
      hasPlaceResults: !!data.place_results,
      hasLocalResults: !!data.local_results,
      topLevelKeys: Object.keys(data),
      placeResultsKeys: data.place_results ? Object.keys(data.place_results) : null,
      localResultsLength: data.local_results ? data.local_results.length : 0
    });

    // Try different response structures
    let placeData = null;
    
    if (data.place_results) {
      placeData = data.place_results;
      console.log('Using place_results data');
    } else if (data.local_results && data.local_results.length > 0) {
      placeData = data.local_results[0];
      console.log('Using first local_results entry');
    } else {
      console.warn('No place or local results found in SerpAPI response');
      console.log('Available keys:', Object.keys(data));
      return null;
    }

    // Debug: Log the place data structure
    console.log('Place Data Structure:', {
      hasReviews: !!placeData.reviews,
      reviewsType: typeof placeData.reviews,
      reviewsLength: Array.isArray(placeData.reviews) ? placeData.reviews.length : 'not array',
      hasUserReviews: !!placeData.user_reviews,
      userReviewsType: typeof placeData.user_reviews,
      userReviewsLength: Array.isArray(placeData.user_reviews) ? placeData.user_reviews.length : 'not array',
      rating: placeData.rating || placeData.reviews_rating,
      reviewCount: placeData.review_count || placeData.reviews_count || placeData.reviews,
      placeDataKeys: Object.keys(placeData)
    });

    // Format the response data with better error handling
    const businessData: BusinessReviewData = {
      rating: placeData.rating || placeData.reviews_rating || 0,
      reviewCount: placeData.review_count || placeData.reviews_count || (typeof placeData.reviews === 'number' ? placeData.reviews : 0),
      reviews: [],
      businessInfo: {
        address: placeData.address || '',
        placeId: placeData.place_id || ''
      }
    };

    // Handle reviews data safely - check multiple possible fields
    let reviewsArray = null;
    
    if (placeData.user_reviews && Array.isArray(placeData.user_reviews)) {
      reviewsArray = placeData.user_reviews;
      console.log('Using user_reviews array');
    } else if (placeData.reviews && Array.isArray(placeData.reviews)) {
      reviewsArray = placeData.reviews;
      console.log('Using reviews array');
    } else {
      console.log('No reviews array found. Available review fields:', {
        reviews: typeof placeData.reviews,
        user_reviews: typeof placeData.user_reviews,
        reviewsValue: placeData.reviews,
        userReviewsValue: placeData.user_reviews
      });
    }

    if (reviewsArray && reviewsArray.length > 0) {
      try {
        businessData.reviews = formatReviews(reviewsArray);
        console.log(`Successfully formatted ${businessData.reviews.length} reviews`);
      } catch (formatError) {
        console.error('Error formatting reviews:', formatError);
        console.log('Sample review data:', reviewsArray[0]);
        businessData.reviews = [];
      }
    } else if (placeData.place_id) {
      // If no reviews in initial response, try fetching detailed reviews
      console.log('No reviews in initial response, trying detailed reviews fetch...');
      try {
        const detailedReviews = await fetchDetailedReviews(placeData.place_id, apiKey);
        if (detailedReviews && detailedReviews.length > 0) {
          businessData.reviews = detailedReviews;
          console.log(`Successfully fetched ${detailedReviews.length} detailed reviews`);
        }
      } catch (detailError) {
        console.error('Error fetching detailed reviews:', detailError);
      }
    }

    console.log(`Final business data: ${businessData.reviews.length} reviews, rating: ${businessData.rating}`);
    return businessData;

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return null;
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
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Exceptional service from start to finish. The team made our move to Switzerland seamless and stress-free.",
      verified: true
    },
    {
      author: "Michael R.",
      rating: 5,
      date: "1 month ago", 
      text: "Professional, knowledgeable, and incredibly helpful. Highly recommend for anyone relocating to Switzerland.",
      verified: true
    },
    {
      author: "Lisa K.",
      rating: 5,
      date: "2 months ago",
      text: "Outstanding support throughout our relocation. They went above and beyond our expectations.",
      verified: true
    }
  ];
} 
require('dotenv').config();
const SerpApi = require('serpapi');
const fs = require('fs');
const path = require('path');

// Replace with your API key from .env file
const apiKey = process.env.SERPAPI_KEY;

// List of companies with their Google Maps URLs or place IDs
// You'll need to find these for each company
const companies = [
  {
    name: "Auris Relocation",
    slug: "auris-relocation",
    placeId: "ChIJr4veBNm5j4ARRlb1uiWUxKQ", // Example - replace with actual Google Place ID
    googleMapsUrl: "https://www.google.com/maps/place/Auris+Relocation/@47.3668281,8.5384901,15z"
  },
  // Add other companies here with their place IDs or Google Maps URLs
];

async function fetchReviews() {
  console.log("Starting to fetch reviews...");
  
  for (const company of companies) {
    try {
      console.log(`Fetching reviews for ${company.name}...`);
      
      // Create search parameters
      const params = {
        engine: "google_maps",
        api_key: apiKey
      };
      
      // Add either place_id or q parameter
      if (company.placeId) {
        params.place_id = company.placeId;
      } else if (company.googleMapsUrl) {
        params.q = company.name;
        params.ll = "@47.3668281,8.5384901,15z"; // Example coordinates - adjust based on company
      }
      
      // Call the SerpAPI
      const search = new SerpApi();
      const data = await search.json(params);
      
      if (data && data.place_results) {
        // Extract relevant review data
        const reviewData = {
          companyName: company.name,
          companySlug: company.slug,
          rating: data.place_results.rating || 0,
          reviewCount: data.place_results.reviews_count || 0,
          lastUpdated: new Date().toISOString(),
          reviews: []
        };
        
        // Get reviews if available
        if (data.place_results.reviews) {
          reviewData.reviews = data.place_results.reviews.map(review => ({
            author: review.user?.name || 'Anonymous',
            authorImage: review.user?.thumbnail || '',
            date: review.date || '',
            content: review.snippet || '',
            rating: review.rating || 0
          })).slice(0, 5); // Get 5 most recent reviews
        }
        
        // Save to content file
        const filePath = path.join(
          process.cwd(),
          'src',
          'content',
          'reviews',
          `${company.slug}.json`
        );
        
        fs.writeFileSync(filePath, JSON.stringify(reviewData, null, 2));
        console.log(`✓ Updated reviews for ${company.name}`);
      } else {
        console.error(`× No review data found for ${company.name}`);
      }
    } catch (error) {
      console.error(`× Error fetching reviews for ${company.name}:`, error);
    }
  }
  
  console.log("Review fetch completed.");
}

// Run the function
fetchReviews(); 
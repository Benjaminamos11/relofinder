// Netlify build plugin to fetch reviews during build time
const fs = require('fs');
const path = require('path');

// We'll use the same fetch-reviews function we created
const fetchReviews = require('../functions/fetch-reviews');

module.exports = {
  onPreBuild: async ({ utils }) => {
    console.log('Fetching reviews during build...');
    try {
      // Create the reviews directory if it doesn't exist
      const reviewsDir = path.join(process.cwd(), 'src', 'content', 'reviews');
      if (!fs.existsSync(reviewsDir)) {
        fs.mkdirSync(reviewsDir, { recursive: true });
      }

      // Call our function to fetch reviews
      const result = await fetchReviews.handler({}, {});
      
      if (result.statusCode === 200) {
        const data = JSON.parse(result.body);
        console.log(`Successfully fetched ${data.count} company reviews.`);
      } else {
        console.error('Error fetching reviews:', result.body);
        utils.build.failBuild('Failed to fetch reviews during build');
      }
    } catch (error) {
      console.error('Error in fetch-reviews build plugin:', error);
      // Don't fail the build if reviews can't be fetched
      // utils.build.failBuild('Error fetching reviews during build');
    }
  }
}; 
// Function to manually trigger review updates (secured with an API key)
const fetchReviews = require('./fetch-reviews');

exports.handler = async function(event, context) {
  // Basic security check - require API key
  const apiKey = event.headers.authorization || event.queryStringParameters?.key;
  
  if (!apiKey || apiKey !== process.env.REVIEW_UPDATE_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized. Valid API key required." })
    };
  }
  
  try {
    console.log("Manually triggering review update...");
    
    // Call the fetch-reviews function
    const result = await fetchReviews.handler(event, context);
    
    return result;
  } catch (error) {
    console.error('Error triggering review update:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error triggering review update", error: error.message })
    };
  }
}; 
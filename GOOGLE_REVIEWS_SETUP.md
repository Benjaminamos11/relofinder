# Google Reviews Integration Setup

This guide explains how to set up real Google My Business reviews for your ReloFinder companies using SerpAPI.

## Overview

The Google Reviews integration fetches real customer reviews from Google My Business listings and displays them on company detail pages. This provides authentic, up-to-date customer feedback instead of static testimonials.

## Prerequisites

1. **SerpAPI Account**: Sign up at [serpapi.com](https://serpapi.com/) to get your API key
2. **Google My Business URL**: Each company needs a Google My Business listing

## Setup Steps

### 1. Get Your SerpAPI Key

1. Visit [SerpAPI](https://serpapi.com/) and create an account
2. SerpAPI provides 100 free searches per month
3. Copy your API key from the dashboard

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# SerpAPI Configuration
SERPAPI_KEY=your_serpapi_key_here

# Optional: Force development mode (uses mock data)
NODE_ENV=development
```

### 3. Add Google My Business URLs to Company Data

Update your company markdown files in `src/content/companies/` to include the Google My Business URL:

```yaml
---
id: "your-company-id"
name: "Your Company Name"
# ... other fields ...
googleMyBusinessUrl: "https://g.co/kgs/your-google-maps-link"
# ... rest of your data ...
---
```

#### Finding Your Google My Business URL

1. Search for your business on Google Maps
2. Click on your business listing
3. Copy the URL or use the "Share" button to get the `g.co/kgs/` short link

**Example URLs that work:**
- `https://g.co/kgs/dqKkL75` (short format - recommended)
- `https://maps.google.com/maps/place/Your+Business+Name`
- Full Google Maps URLs with place_id parameters

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to a company page with a `googleMyBusinessUrl`
3. Check the browser console for SerpAPI logs
4. Reviews section will show real Google reviews if successful

## How It Works

### Development Mode
- When `NODE_ENV=development` or no `SERPAPI_KEY` is provided
- Shows mock review data instead of making API calls
- Displays "(Development mode - showing mock data)" indicator

### Production Mode
- Makes real API calls to SerpAPI when `SERPAPI_KEY` is configured
- Fetches live Google My Business reviews
- Falls back to mock data if API call fails
- Shows integration status in the reviews section

### Data Flow

1. **Company Page Load**: Checks for `googleMyBusinessUrl` and `SERPAPI_KEY`
2. **API Request**: Calls SerpAPI with Google Maps URL
3. **Data Processing**: Formats reviews into consistent structure
4. **Display**: Shows reviews with proper Schema.org markup for SEO
5. **Fallback**: Uses mock data if API fails or is not configured

## API Response Format

SerpAPI returns Google My Business data including:

```typescript
{
  place_results: {
    reviews_rating: 4.5,
    reviews_count: 124,
    reviews: [
      {
        author: { name: "John Doe", local_guide: true },
        rating: 5,
        date: "2024-01-15",
        snippet: "Excellent service...",
        likes: 3
      }
      // ... more reviews
    ]
  }
}
```

## Pricing

- **SerpAPI Free Tier**: 100 searches/month
- **Cost per search**: ~$0.05 for additional searches
- **Caching**: Consider implementing caching for production use

## Troubleshooting

### Reviews Not Loading
1. Check browser console for error messages
2. Verify `SERPAPI_KEY` is correct in environment
3. Ensure `googleMyBusinessUrl` is valid
4. Check SerpAPI account has remaining credits

### Mock Data Showing in Production
1. Verify `NODE_ENV` is not set to "development"
2. Check `SERPAPI_KEY` environment variable exists
3. Ensure company has valid `googleMyBusinessUrl`

### API Rate Limits
- SerpAPI limits: 100 free searches/month
- Consider caching responses for production
- Implement fallback to static data if quota exceeded

## SEO Benefits

The integration provides:
- **Schema.org Review markup** for rich snippets
- **Real customer feedback** improves page authority
- **Fresh content** from recent reviews
- **Structured data** for search engines

## Security Notes

- Never commit your `SERPAPI_KEY` to version control
- Use environment variables for sensitive data
- Consider rate limiting in production applications
- Monitor API usage to avoid unexpected charges

## Example Implementation

See `src/utils/google-reviews.ts` for the complete implementation and `src/pages/companies/[id].astro` for usage example.

The system automatically handles:
- URL format detection and parsing
- Review data formatting and validation
- Error handling and fallbacks
- Schema.org markup generation
- Development vs production modes 
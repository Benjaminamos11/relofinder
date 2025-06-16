import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getCollection } from 'astro:content';

// Generate static paths for all companies
export async function getStaticPaths() {
  const companies = await getCollection('companies');
  return companies.map((company: any) => ({
    params: { companyId: company.data.id }
  }));
}

// Initialize Supabase client with fallback values
const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || 'placeholder-key';

let supabase: any = null;
try {
  if (import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_ANON_KEY) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.log('Supabase not available:', error);
}

export const GET: APIRoute = async ({ params, request }) => {
  const { companyId } = params;
  
  if (!companyId) {
    return new Response(JSON.stringify({ error: 'Company ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // If Supabase is available, check for cached analysis
    if (supabase) {
      const { data: cachedAnalysis } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('company_id', companyId)
        .gte('generated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('generated_at', { ascending: false })
        .limit(1);

      if (cachedAnalysis && cachedAnalysis.length > 0) {
        return new Response(JSON.stringify(cachedAnalysis[0]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get all reviews for this company
      const { data: reviews, error: reviewsError } = await supabase
        .from('company_reviews')
        .select('*')
        .eq('company_id', companyId);

      if (!reviewsError && reviews && reviews.length > 0) {
        // Generate AI analysis
        const analysis = await generateAIAnalysis(reviews, companyId);

        // Cache the analysis
        const { error: insertError } = await supabase
          .from('ai_analysis')
          .insert({
            company_id: companyId,
            analysis_text: JSON.stringify(analysis),
            sentiment_score: analysis.sentiment_score || 0.7,
            key_themes: analysis.key_themes || [],
            pros: analysis.strengths || [],
            cons: analysis.areas_for_improvement || [],
            generated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error caching analysis:', insertError);
        }

        return new Response(JSON.stringify(analysis), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Fallback: Generate mock analysis without database
    const mockAnalysis = await generateMockAnalysis(companyId);
    return new Response(JSON.stringify(mockAnalysis), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    
    // Return fallback analysis
    return new Response(JSON.stringify({
      error: 'Analysis temporarily unavailable',
      strengths: ['Established relocation services', 'Professional team', 'Swiss market expertise'],
      areas_for_improvement: ['Response time optimization', 'Service transparency'],
      recommendation: 'Based on available information, this company provides reliable relocation services with opportunities for improvement.',
      sentiment_score: 0.7
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function generateAIAnalysis(reviews: any[], companyId: string) {
  // For now, return a structured mock analysis
  // In production, this would call OpenAI API
  
  const positiveKeywords = ['excellent', 'great', 'amazing', 'helpful', 'professional', 'smooth', 'efficient'];
  const negativeKeywords = ['slow', 'expensive', 'poor', 'bad', 'terrible', 'disappointing'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let totalRating = 0;
  
  reviews.forEach(review => {
    const text = review.text?.toLowerCase() || '';
    positiveKeywords.forEach(word => {
      if (text.includes(word)) positiveCount++;
    });
    negativeKeywords.forEach(word => {
      if (text.includes(word)) negativeCount++;
    });
    totalRating += review.rating || 0;
  });

  const avgRating = totalRating / reviews.length;
  const sentimentScore = Math.min(0.9, Math.max(0.1, (positiveCount - negativeCount + reviews.length) / (reviews.length * 2)));

  const strengths = [];
  const improvements = [];

  // Generate insights based on ratings and sentiment
  if (avgRating >= 4.5) {
    strengths.push('Consistently high client satisfaction');
    strengths.push('Excellent service delivery');
  } else if (avgRating >= 4.0) {
    strengths.push('Strong client satisfaction');
    strengths.push('Reliable service quality');
  }

  if (positiveCount > negativeCount * 2) {
    strengths.push('Positive client feedback');
    strengths.push('Professional communication');
  }

  if (reviews.length >= 20) {
    strengths.push('Extensive client experience');
  }

  // Areas for improvement
  if (avgRating < 4.0) {
    improvements.push('Service quality enhancement');
  }

  if (negativeCount > positiveCount) {
    improvements.push('Client communication improvement');
  }

  if (reviews.length < 10) {
    improvements.push('Expand client feedback collection');
  }

  // Default improvements if none identified
  if (improvements.length === 0) {
    improvements.push('Continue service excellence');
    improvements.push('Maintain communication standards');
  }

  // Default strengths if none identified
  if (strengths.length === 0) {
    strengths.push('Professional relocation services');
    strengths.push('Swiss market expertise');
  }

  let recommendation = '';
  if (avgRating >= 4.5) {
    recommendation = 'Highly recommended relocation partner with excellent client satisfaction and proven track record.';
  } else if (avgRating >= 4.0) {
    recommendation = 'Reliable relocation partner with good client satisfaction and room for optimization.';
  } else {
    recommendation = 'Developing relocation services with opportunities for significant improvement.';
  }

  return {
    strengths: strengths.slice(0, 4),
    areas_for_improvement: improvements.slice(0, 3),
    recommendation,
    sentiment_score: sentimentScore,
    key_themes: ['relocation services', 'client satisfaction', 'swiss expertise'],
    total_reviews: reviews.length,
    average_rating: Math.round(avgRating * 10) / 10
  };
}

async function generateMockAnalysis(companyId: string) {
  // Generate realistic mock analysis for demo purposes
  const mockStrengths = [
    'Professional service delivery',
    'Swiss market expertise', 
    'Comprehensive relocation support',
    'Established client relationships'
  ];

  const mockImprovements = [
    'Expand digital communication channels',
    'Enhance response time optimization',
    'Strengthen client feedback systems'
  ];

  return {
    strengths: mockStrengths.slice(0, 3),
    areas_for_improvement: mockImprovements.slice(0, 2),
    recommendation: 'This company demonstrates solid relocation expertise with opportunities for digital enhancement and process optimization.',
    sentiment_score: 0.75,
    key_themes: ['relocation services', 'swiss expertise', 'professional support'],
    total_reviews: 0,
    average_rating: 4.2
  };
}

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}; 
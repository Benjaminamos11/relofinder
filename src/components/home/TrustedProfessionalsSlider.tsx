import { useState, useEffect, useRef } from 'react';

type Review = {
  author_name: string;
  rating: number;
  review_text: string;
  review_date: string;
};

type AISummary = {
  verdict: string;
  review_count: number;
};

type CompanySlide = {
  id: string;
  name: string;
  slug: string;
  tier: 'preferred' | 'partner' | 'standard';
  rating_avg: number;
  reviews: Review[];
  aiSummary: AISummary | null;
};

type Props = {
  companies: CompanySlide[];
};

type GenerationState = 'idle' | 'generating' | 'success' | 'error';

export default function TrustedProfessionalsSlider({ companies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll every 8 seconds
  useEffect(() => {
    if (!isPaused && companies.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % companies.length);
      }, 8000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, companies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % companies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + companies.length) % companies.length);
    // Reset generation state when changing slides
    setGenerationState('idle');
    setGeneratedSummary(null);
    setProgress(0);
  };

  const handleGenerateAI = async () => {
    const company = companies[currentIndex];
    
    setGenerationState('generating');
    setProgress(0);

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await fetch('https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/generate-ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE'
        },
        body: JSON.stringify({ relocator_id: company.id })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      
      setProgress(100);
      setGeneratedSummary(data.verdict || 'AI summary generated successfully!');
      setGenerationState('success');

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'ai_summary_generated',
          company_id: company.id,
          company_name: company.name,
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error generating AI summary:', error);
      setGenerationState('error');
      setProgress(0);
    }
  };

  if (!companies.length) {
    return null;
  }

  const currentCompany = companies[currentIndex];
  
  // Reset generation state when company changes
  useEffect(() => {
    setGenerationState('idle');
    setGeneratedSummary(null);
    setProgress(0);
  }, [currentIndex]);

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trusted <span className="bg-gradient-to-r from-[#B61919] to-[#DF3030] bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl">
              Real client experiences from verified Google Reviews of trusted Swiss relocation agencies
            </p>
          </div>
          <a
            href="/companies"
            className="hidden md:inline-flex items-center text-sm font-medium text-gray-700 hover:text-[#B61919] transition-colors"
          >
            View all
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Slider Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Company Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <a
                href={`/companies/${currentCompany.slug}`}
                className="text-xl font-semibold text-gray-900 hover:text-[#B61919] transition-colors"
              >
                {currentCompany.name}
              </a>
              {(currentCompany.tier === 'preferred' || currentCompany.tier === 'partner') && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentCompany.tier === 'preferred'
                      ? 'bg-[#FFF7E6] text-[#8A5B00] border border-[#FDE68A]'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {currentCompany.tier === 'preferred' ? 'Preferred Partner' : 'Partner'}
                </span>
              )}
            </div>
            <a
              href={`/companies/${currentCompany.slug}`}
              className="text-sm font-medium text-gray-600 hover:text-[#B61919] transition-colors"
            >
              View Profile →
            </a>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review Cards (3) */}
            {currentCompany.reviews.slice(0, 3).map((review, idx) => (
              <article
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Rating & Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.review_date).toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Quote Icon */}
                <svg
                  className="w-6 h-6 text-gray-300 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Review Text */}
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 mb-4">
                  {review.review_text}
                </p>

                {/* Author */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{review.author_name}</p>
                  <p className="text-xs text-gray-500">Google Review</p>
                </div>
              </article>
            ))}

          </div>

          {/* AI Summary Section - Below Reviews */}
          <div className="mt-6">
              {generationState === 'idle' && (
                <button
                  onClick={handleGenerateAI}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-[#B61919] hover:text-[#B61919] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Summary
                </button>
              )}

              {generationState === 'generating' && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#B61919] to-[#DF3030] rounded-lg flex items-center justify-center animate-pulse">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">Generating AI Insights...</p>
                        <p className="text-sm text-gray-600">Analyzing {currentCompany.reviews.length}+ verified reviews</p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#B61919] to-[#DF3030] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {generationState === 'success' && generatedSummary && (
                <div className="bg-gradient-to-br from-[#FFF7E6] to-white rounded-xl p-6 border border-[#FDE68A] shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#B61919] to-[#DF3030] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">AI Insights</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{generatedSummary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600 mt-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Analysis complete</span>
                  </div>
                </div>
              )}

              {generationState === 'error' && (
                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#FF6F61] mb-3">Failed to generate AI summary</p>
                    <button
                      onClick={handleGenerateAI}
                      className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
          </div>

          {/* Navigation Arrows */}
          {companies.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Previous company"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Next company"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {companies.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {companies.map((company, idx) => (
              <button
                key={company.id}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-gradient-to-r from-[#B61919] to-[#DF3030]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to ${company.name}`}
              />
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#B61919] to-[#DF3030] bg-clip-text text-transparent">
                5,000+
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Successful Relocations</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#B61919] to-[#DF3030] bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Verified Partners</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#B61919] to-[#DF3030] bg-clip-text text-transparent">
                26
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Swiss Cantons</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#B61919] to-[#DF3030] bg-clip-text text-transparent">
                4.9
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>

        {/* View All CTA (Mobile) */}
        <div className="text-center mt-8 md:hidden">
          <a
            href="/companies"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#B61919] to-[#DF3030] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            View All Companies & Reviews
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}


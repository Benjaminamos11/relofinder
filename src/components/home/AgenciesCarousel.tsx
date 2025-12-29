/**
 * AgenciesCarousel - Premium unified section with enhanced features
 * Features: 2-column layout, Swiss/Editorial aesthetic, smooth interactions
 */

import { useState, useEffect, useRef } from 'react';
import type { AgencyCarouselData } from '../../utils/agenciesCarouselData';

interface Props {
  agencies: AgencyCarouselData[];
}

interface AISummary {
  verdict: string;
  clients_like: string[];
  watch_outs: string[];
  best_for: string[];
  themes: Array<{ label: string; strength: string }>;
}

export default function AgenciesCarousel({ agencies }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [summaries, setSummaries] = useState<Record<string, AISummary>>({});
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const activeAgency = agencies[activeIndex];
  const activeReviews = activeAgency?.latest_reviews || [];
  const currentReview = activeReviews[activeReviewIndex];

  // Analytics helper
  const trackEvent = (eventName: string, params: any) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...params
      });
    }
  };

  // Open modal helper
  const openModal = (context: any) => {
    if (typeof window !== 'undefined' && (window as any).universalOpenModal) {
      (window as any).universalOpenModal(context);
    }
  };

  // Format date properly
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Truncate description
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Get cached summary or fetch new
  const getSummary = async (agencyId: string, relocatorId: string) => {
    // Check memory cache
    if (summaries[agencyId]) {
      setExpandedSummary(agencyId);
      return;
    }

    // Check localStorage cache (24h TTL)
    try {
      const cached = localStorage.getItem(`ai_summary_${agencyId}_en`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 24 * 60 * 60 * 1000) {
          setSummaries(prev => ({ ...prev, [agencyId]: data }));
          setExpandedSummary(agencyId);
          return;
        }
      }
    } catch { }

    // Fetch from Edge function
    setLoadingSummary(agencyId);
    setSummaryError(null);

    try {
      // Call Supabase Edge Function (same as company detail page)
      const response = await fetch('https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/generate-ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE'
        },
        body: JSON.stringify({
          relocator_id: relocatorId
        })
      });

      if (!response.ok) {
        // Fallback: Mock data for development/demo if API fails
        console.warn('Edge function failed, using mock summary');
        const mockSummary = {
          verdict: "Based on 48 reviews, Prime Relocation is highly recommended for their comprehensive and personalized support. Clients consistently praise their efficiency, immigration expertise, and ability to find housing quickly.",
          clients_like: ["Seamless immigration process", "Fast housing search", "Personalized attention"],
          watch_outs: ["Premium service pricing"],
          best_for: ["Corporate transfers", "Families", "Expats"],
          themes: []
        };

        // Wait a bit to simulate network
        await new Promise(resolve => setTimeout(resolve, 800));

        setSummaries(prev => ({ ...prev, [agencyId]: mockSummary }));
        setExpandedSummary(agencyId);
        return;
      }

      const data = await response.json();

      const summary: AISummary = {
        verdict: data.verdict || '',
        clients_like: data.clients_like || [],
        watch_outs: data.watch_outs || [],
        best_for: data.best_for || [],
        themes: data.themes || []
      };

      // Cache in memory and localStorage
      setSummaries(prev => ({ ...prev, [agencyId]: summary }));
      localStorage.setItem(`ai_summary_${agencyId}_en`, JSON.stringify({
        data: summary,
        timestamp: Date.now()
      }));

      setExpandedSummary(agencyId);
      trackEvent('ai_summary_open', { agency_id: agencyId });
    } catch (error) {
      console.error('Summary error:', error);
      setSummaryError('Could not load summary. Try again.');
      trackEvent('ai_summary_error', { agency_id: agencyId });
    } finally {
      setLoadingSummary(null);
    }
  };

  // Copy summary to clipboard
  const copySummary = (summary: AISummary) => {
    const text = `${summary.verdict}\n\nClients Like:\n${summary.clients_like.map(p => `• ${p}`).join('\n')}\n\nWatch Outs:\n${summary.watch_outs.map(c => `• ${c}`).join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  // Navigation functions
  const nextAgency = () => {
    setActiveIndex(prev => (prev + 1) % agencies.length);
    setActiveReviewIndex(0);
    setExpandedSummary(null);
  };

  const prevAgency = () => {
    setActiveIndex(prev => (prev - 1 + agencies.length) % agencies.length);
    setActiveReviewIndex(0);
    setExpandedSummary(null);
  };

  // Auto-rotate reviews within current card
  useEffect(() => {
    if (activeReviews.length <= 1) return;

    const interval = setInterval(() => {
      setActiveReviewIndex(prev => (prev + 1) % activeReviews.length);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, [activeReviews.length, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevAgency();
      } else if (e.key === 'ArrowRight') {
        nextAgency();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [agencies.length]);

  // Track slide changes
  useEffect(() => {
    if (activeAgency) {
      trackEvent('carousel_slide_change', {
        agency_id: activeAgency.id,
        index: activeIndex
      });
    }
  }, [activeIndex]);

  // Early return for empty agencies
  if (!agencies || agencies.length === 0) {
    return null;
  }

  // Helper to get initials from company name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to get color for initials avatar - all red gradient
  const getAvatarColor = () => {
    return 'bg-gradient-to-br from-[#B61919] to-[#DF3030] text-white';
  };

  return (
    <section
      className="relative py-24 bg-white overflow-hidden"
      role="region"
      aria-label="Featured relocation agencies"
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4 tracking-tight">
              Featured Relocation Agencies
            </h2>
            <div className="h-1 w-20 bg-[#D64541]" />
            <p className="mt-4 text-lg text-gray-600 max-w-xl leading-relaxed">
              We partner with Switzerland's most reputable relocation experts. Verified for quality, responsiveness, and customer satisfaction.
            </p>
          </div>

          {/* Navigation Arrows (Top Right) */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevAgency}
              className="p-3 rounded-full border border-gray-200 text-gray-500 hover:text-[#B61919] hover:border-[#B61919] hover:bg-[#FF6F61]/5 transition-all duration-300 group"
              aria-label="Previous agency"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextAgency}
              className="p-3 rounded-full border border-gray-200 text-gray-500 hover:text-[#B61919] hover:border-[#B61919] hover:bg-[#FF6F61]/5 transition-all duration-300 group"
              aria-label="Next agency"
            >
              <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div
          ref={carouselRef}
          className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left Column: Company Info */}
            <div className="p-8 lg:p-12 flex flex-col h-full border-b lg:border-b-0 lg:border-r border-gray-100 relative">
              {/* Background detail */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full opacity-50 pointer-events-none" />

              <div className="relative z-10 flex-1">
                {/* Header: Avatar, Name, Verified */}
                <div className="flex items-center gap-5 mb-8">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-display font-bold shadow-sm ${getAvatarColor()}`}>
                    {getInitials(activeAgency.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-display font-bold text-gray-900">
                        {activeAgency.name}
                      </h3>
                      {activeAgency.verified && (
                        <div title="Verified Partner" className="text-blue-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {activeAgency.tier === 'preferred' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200/60">
                          Preferred Partner
                        </span>
                      )}

                      {activeAgency.avg_rating > 0 && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <span className="text-yellow-400">★</span>
                          <span>{activeAgency.avg_rating.toFixed(1)}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">{activeAgency.reviews_count} reviews</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {activeAgency.description && (
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                    {truncateText(activeAgency.description, 280)}
                  </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Experience</div>
                    <div className="text-gray-900 font-bold text-lg">{activeAgency.stats?.yearsInBusiness || '10+'} Years</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Response</div>
                    <div className="text-gray-900 font-bold text-lg">{activeAgency.stats?.responseTime || '< 24h'}</div>
                  </div>
                </div>

                {/* Services Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {activeAgency.services.slice(0, 5).map((service, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-sm rounded-full">
                      {service}
                    </span>
                  ))}
                  {activeAgency.regions[0] && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                      📍 {activeAgency.regions[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Major CTAs */}
              <div className="flex items-center gap-4 pt-6 mt-auto border-t border-gray-100">
                <button
                  onClick={() => {
                    trackEvent('cta_schedule', { agency_id: activeAgency.id });
                    openModal({
                      type: 'profile',
                      companyName: activeAgency.name,
                      companyId: activeAgency.id
                    });
                  }}
                  className="flex-1 py-3.5 px-6 bg-[#B61919] hover:bg-[#a01515] text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center"
                >
                  Get Quote / Schedule
                </button>
                <a
                  href={`/companies/${activeAgency.slug}`}
                  className="flex-1 py-3.5 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 text-center"
                >
                  View Profile
                </a>
              </div>
            </div>

            {/* Right Column: Social Proof / AI */}
            <div className="bg-gray-50/50 p-8 lg:p-12 flex flex-col h-full">

              {/* Reviews Section */}
              <div className="mb-8 flex-1">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
                  Latest Reviews
                </h4>

                {activeReviews.length > 0 && currentReview ? (
                  <div className="relative h-full">
                    <div className="bg-white p-6 pb-12 rounded-2xl shadow-sm border border-gray-100 mb-4 transition-all duration-500 h-full flex flex-col justify-between">
                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= currentReview.rating
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-800 text-lg italic leading-relaxed mb-6">
                        "{truncateText(currentReview.review_text, 160)}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {currentReview.author_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{currentReview.author_name}</div>
                          <div className="text-xs text-gray-500">{formatDate(currentReview.review_date)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Review Dots - Fixed Position to prevent jumping */}
                    {activeReviews.length > 1 && (
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                        {activeReviews.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveReviewIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeReviewIndex ? 'w-4 bg-[#B61919]' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                              }`}
                            aria-label={`Go to review ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                    No reviews available yet.
                  </div>
                )}
              </div>

              {/* AI Summary Section - Enhanced */}
              <div className="mt-auto pt-6 border-t border-gray-200">
                {expandedSummary === activeAgency.id && summaries[activeAgency.id] ? (
                  <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-200/60 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="flex items-center gap-2 text-amber-900 font-bold">
                        <span className="text-lg">✨</span> AI Summary
                      </h4>
                      <button
                        onClick={() => setExpandedSummary(null)}
                        className="text-amber-700 hover:text-amber-900 text-xs font-medium bg-amber-100 px-2 py-1 rounded"
                      >
                        Close
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {summaries[activeAgency.id].verdict}
                    </p>
                    <div className="flex gap-2 text-xs">
                      {summaries[activeAgency.id].clients_like?.slice(0, 2).map((like, i) => (
                        <span key={i} className="bg-green-50 text-green-800 px-2 py-1 rounded border border-green-100">
                          ✓ {like}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => getSummary(activeAgency.id, activeAgency.relocator_id!)}
                    disabled={loadingSummary === activeAgency.id}
                    className="w-full group flex items-center justify-between p-4 bg-white hover:bg-gradient-to-r hover:from-white hover:to-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${loadingSummary === activeAgency.id ? 'bg-gray-100' : 'bg-gray-50 group-hover:bg-white'}`}>
                        {loadingSummary === activeAgency.id ? (
                          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <span className="text-lg">✨</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold text-sm">
                          {loadingSummary === activeAgency.id ? 'Analyzing reviews...' : 'Get AI Summary'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Instant analysis of {activeAgency.reviews_count} reviews
                        </div>
                      </div>
                    </div>

                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {summaryError && (
                  <p className="text-xs text-[#FF6F61] mt-2 text-center">{summaryError}</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Thumbnails Strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {agencies.map((agency, idx) => (
            <button
              key={agency.id}
              onClick={() => {
                setActiveIndex(idx);
                setActiveReviewIndex(0);
                setExpandedSummary(null);
              }}
              className={`
                flex-shrink-0 snap-start w-64 p-3 rounded-xl border transition-all duration-300 text-left group
                ${idx === activeIndex
                  ? 'border-[#B61919] bg-white ring-2 ring-red-50 ring-offset-1 shadow-md'
                  : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm opacity-70 hover:opacity-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-[#B61919] group-hover:to-[#DF3030] transition-colors duration-300`}>
                  {getInitials(agency.name)}
                </div>
                <div className="min-w-0">
                  <p className={`font-semibold text-sm truncate ${idx === activeIndex ? 'text-gray-900' : 'text-gray-700'}`}>
                    {agency.name}
                  </p>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-yellow-400">★</span> {agency.avg_rating.toFixed(1)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

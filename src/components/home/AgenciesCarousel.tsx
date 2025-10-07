/**
 * AgenciesCarousel - Premium unified section
 * Replaces Featured Agencies + Reviews sections
 */

import { useState, useEffect, useRef } from 'react';
import type { AgencyCarouselData } from '../../utils/agenciesCarouselData';

interface Props {
  agencies: AgencyCarouselData[];
}

interface AISummary {
  summary: string;
  pros: string[];
  cons: string[];
  themes: string[];
  last_updated_at: string;
}

export default function AgenciesCarousel({ agencies }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [summaries, setSummaries] = useState<Record<string, AISummary>>({});
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const activeAgency = agencies[activeIndex];

  // Analytics helper
  const trackEvent = (eventName: string, params: any) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...params
      });
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
    } catch {}

    // Fetch from Edge function
    setLoadingSummary(agencyId);
    setSummaryError(null);

    try {
      const response = await fetch(`/api/generate-ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relocatorId: relocatorId,
          lang: 'en'
        })
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const data = await response.json();
      
      const summary: AISummary = {
        summary: data.summary || '',
        pros: data.strengths || [],
        cons: data.drawbacks || [],
        themes: data.themes || [],
        last_updated_at: new Date().toISOString()
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
    const text = `${summary.summary}\n\nStrengths:\n${summary.pros.map(p => `• ${p}`).join('\n')}\n\nConsiderations:\n${summary.cons.map(c => `• ${c}`).join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(prev => Math.min(agencies.length - 1, prev + 1));
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

  if (!agencies.length) return null;

  // Helper to get initials from company name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to get color for initials avatar based on tier
  const getAvatarColor = (tier: string) => {
    switch (tier) {
      case 'preferred':
        return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white';
      case 'partner':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
    }
  };

  return (
    <section
      className="relative py-16 lg:py-24 bg-white"
      role="region"
      aria-label="Featured relocation agencies"
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Featured Relocation Agencies
            <div className="h-1 w-24 bg-gradient-to-r from-[#B61919] to-[#DF3030] rounded-full mt-3" />
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Verified partners with proven track records in Swiss relocations.
          </p>
        </div>

        {/* Large Card */}
        <div
          ref={carouselRef}
          className="bg-white rounded-2xl p-8 lg:p-10 shadow-lg border border-gray-100 mb-6 max-w-[1040px] mx-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getAvatarColor(activeAgency.tier)}`}>
                {getInitials(activeAgency.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeAgency.name}
                  </h3>
                  {activeAgency.verified && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {activeAgency.tier === 'preferred' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-900 border border-yellow-300/50">
                    ⭐ Preferred Partner
                  </span>
                )}
                {activeAgency.tier === 'partner' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    Partner
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {activeAgency.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
              >
                {service}
              </span>
            ))}
            {activeAgency.regions[0] && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                📍 {activeAgency.regions[0]}
              </span>
            )}
          </div>

          {/* Rating */}
          {activeAgency.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(activeAgency.avg_rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 font-medium">
                {activeAgency.avg_rating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({activeAgency.reviews_count} {activeAgency.reviews_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {/* Review Snippet */}
          {activeAgency.latest_review ? (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {activeAgency.latest_review.author_name}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= activeAgency.latest_review!.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      · {formatDate(activeAgency.latest_review.review_date)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed line-clamp-2">
                    {activeAgency.latest_review.review_text}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100 text-center">
              <p className="text-gray-500">
                No reviews yet — be the first to rate {activeAgency.name}.
              </p>
            </div>
          )}

          {/* AI Summary Section */}
          <div className="border-t border-gray-100 pt-6">
            {expandedSummary !== activeAgency.id ? (
              <button
                onClick={() => getSummary(activeAgency.id, activeAgency.relocator_id!)}
                disabled={loadingSummary === activeAgency.id}
                className="w-full py-3 px-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingSummary === activeAgency.id ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading summary...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Get AI Summary</span>
                  </>
                )}
              </button>
            ) : summaries[activeAgency.id] ? (
              <div className="bg-gradient-to-br from-[#FFF7E6] to-white rounded-xl p-6 border-2 border-[#FDE68A]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="text-lg font-bold text-gray-900">AI Summary</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copySummary(summaries[activeAgency.id])}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
                      title="Copy summary"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => setExpandedSummary(null)}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
                    >
                      Hide
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  {summaries[activeAgency.id].summary}
                </p>

                {summaries[activeAgency.id].pros.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Key Strengths</h5>
                    <ul className="space-y-1">
                      {summaries[activeAgency.id].pros.map((pro, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summaries[activeAgency.id].cons.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Considerations</h5>
                    <ul className="space-y-1">
                      {summaries[activeAgency.id].cons.map((con, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-500 italic">
                  Summary generated from {activeAgency.reviews_count} verified reviews
                </p>
              </div>
            ) : null}

            {summaryError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-700 text-sm">{summaryError}</p>
                <button
                  onClick={() => {
                    setSummaryError(null);
                    getSummary(activeAgency.id, activeAgency.relocator_id!);
                  }}
                  className="mt-2 text-red-700 text-sm font-medium hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-6">
            {activeAgency.tier === 'preferred' && (
              <>
                <a
                  href="https://cal.com/relofinder/relofinder-consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('cta_schedule', { agency_id: activeAgency.id })}
                  className="flex-1 min-w-[200px] py-3 px-6 bg-gradient-to-r from-[#B61919] to-[#DF3030] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-center"
                >
                  Schedule Call
                </a>
                <button
                  onClick={() => {
                    trackEvent('cta_quote', { agency_id: activeAgency.id });
                    window.location.href = `/companies/${activeAgency.slug}`;
                  }}
                  className="flex-1 min-w-[200px] py-3 px-6 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Get Quote
                </button>
              </>
            )}
            {activeAgency.tier === 'partner' && (
              <button
                onClick={() => {
                  trackEvent('cta_quote', { agency_id: activeAgency.id });
                  window.location.href = `/companies/${activeAgency.slug}`;
                }}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#B61919] to-[#DF3030] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-center"
              >
                Get Quote
              </button>
            )}
            {activeAgency.tier === 'standard' && (
              <a
                href={`/companies/${activeAgency.slug}`}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                View profile →
              </a>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="max-w-[1040px] mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {agencies.map((agency, idx) => (
              <button
                key={agency.id}
                onClick={() => {
                  setActiveIndex(idx);
                  setExpandedSummary(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(idx);
                  }
                }}
                aria-selected={idx === activeIndex}
                className={`
                  flex-shrink-0 snap-start p-3 rounded-xl border-2 transition-all duration-200
                  ${
                    idx === activeIndex
                      ? 'border-[#B61919] bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#B61919] focus:ring-offset-2
                `}
                style={{ minWidth: '160px' }}
              >
                <div className="flex items-center gap-3">
                  {/* Initials Avatar for thumbnails */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(agency.tier)}`}>
                    {getInitials(agency.name)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {agency.name}
                    </p>
                    {agency.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>★</span>
                        <span>{agency.avg_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}


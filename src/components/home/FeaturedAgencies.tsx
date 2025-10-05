/**
 * Featured Agencies - Compact, Data-Driven
 * Pulls from same dataset as /companies directory
 * Preferred → Partner → Standard, auto-updates
 */

import { useState, useEffect } from 'react';

type CompanyCard = {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  tier: 'preferred' | 'partner' | 'standard';
  rating_avg?: number;
  rating_count?: number;
  services?: string[];
  regions?: string[];
};

interface FeaturedAgenciesProps {
  companies: CompanyCard[];
  limit?: number;
}

const FeaturedAgencies = ({ companies, limit = 10 }: FeaturedAgenciesProps) => {
  const [impressionTracked, setImpressionTracked] = useState(false);

  useEffect(() => {
    // Track impression on first viewport
    if (!impressionTracked && typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if ((window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: 'home_featured_impression',
                ids: companies.slice(0, limit).map((c) => c.id),
              });
            }
            setImpressionTracked(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );

      const section = document.getElementById('featured-agencies');
      if (section) observer.observe(section);

      return () => observer.disconnect();
    }
  }, [companies, limit, impressionTracked]);

  const handleClick = (id: string, action: 'quote' | 'profile') => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'home_featured_click',
        id,
        action,
      });
    }
  };

  const openQuoteModal = (company: CompanyCard) => {
    handleClick(company.id, 'quote');
    if (typeof window !== 'undefined' && (window as any).universalOpenModal) {
      (window as any).universalOpenModal({
        page: 'profile',
        company: company.name,
        companyId: company.id,
      });
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'preferred') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF7E6] text-[#8A5B00] border border-[#FDE68A]">
          Preferred Partner
        </span>
      );
    }
    if (tier === 'partner') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          Partner
        </span>
      );
    }
    return null;
  };

  const displayedCompanies = companies.slice(0, limit);

  return (
    <section
      id="featured-agencies"
      className="py-16 bg-gradient-to-b from-white to-gray-50"
      aria-label="Featured relocation agencies"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Relocation Agencies
            </h2>
            <div
              className="h-0.5 w-24 rounded-full"
              style={{ background: 'var(--rf-grad-red)' }}
            ></div>
          </div>
          <a
            href="/companies"
            className="text-[#B61919] font-semibold hover:underline inline-flex items-center gap-1 text-sm"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedCompanies.map((company, index) => (
            <div
              key={company.id}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-full ${
                company.tier === 'preferred' ? 'border border-[#F1D7DC]' : 'border border-gray-100'
              }`}
            >
              <meta itemProp="position" content={String(index + 1)} />
              <div itemProp="item" itemScope itemType="https://schema.org/Organization">
                {/* Logo & Name */}
                <div className="flex items-start gap-3 mb-3">
                  {company.logo_url ? (
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        itemProp="logo"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-400">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 mb-1"
                      itemProp="name"
                    >
                      {company.name}
                    </h3>
                    <link itemProp="url" href={`/companies/${company.slug}`} />
                    {getTierBadge(company.tier)}
                  </div>
                </div>

                {/* Meta Row */}
                <div className="text-xs text-gray-600 mb-4 space-y-1">
                  {/* Rating */}
                  {company.rating_avg && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-gray-900">{company.rating_avg.toFixed(1)}</span>
                      {company.rating_count && (
                        <span className="text-gray-500">({company.rating_count})</span>
                      )}
                    </div>
                  )}

                  {/* Services & Regions */}
                  <div className="flex flex-wrap items-center gap-1">
                    {company.services?.slice(0, 2).map((service, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {service}
                      </span>
                    ))}
                    {company.regions && company.regions.length > 0 && (
                      <span className="text-gray-500">· {company.regions[0]}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <a
                    href={`/companies/${company.slug}`}
                    onClick={() => handleClick(company.id, 'profile')}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    View Profile
                  </a>
                  <button
                    onClick={() => openQuoteModal(company)}
                    className="flex-1 text-center px-3 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-150 hover:brightness-105 hover:scale-[1.01]"
                    style={{ background: 'var(--rf-grad-red)' }}
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Horizontal Rail */}
        <div className="md:hidden relative">
          {/* Gradient Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
            <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
              {displayedCompanies.map((company, index) => (
                <div
                  key={company.id}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                  className={`snap-start bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between ${
                    company.tier === 'preferred'
                      ? 'border border-[#F1D7DC]'
                      : 'border border-gray-100'
                  }`}
                  style={{ width: '320px', minHeight: '180px' }}
                >
                  <meta itemProp="position" content={String(index + 1)} />
                  <div itemProp="item" itemScope itemType="https://schema.org/Organization">
                    {/* Logo & Name */}
                    <div className="flex items-start gap-3 mb-3">
                      {company.logo_url ? (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={company.logo_url}
                            alt={`${company.name} logo`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            itemProp="logo"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-400">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 mb-1"
                          itemProp="name"
                        >
                          {company.name}
                        </h3>
                        <link itemProp="url" href={`/companies/${company.slug}`} />
                        {getTierBadge(company.tier)}
                      </div>
                    </div>

                    {/* Meta Row */}
                    <div className="text-xs text-gray-600 mb-4 space-y-1">
                      {company.rating_avg && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-bold text-gray-900">{company.rating_avg.toFixed(1)}</span>
                          {company.rating_count && (
                            <span className="text-gray-500">({company.rating_count})</span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1">
                        {company.services?.slice(0, 2).map((service, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {service}
                          </span>
                        ))}
                        {company.regions && company.regions.length > 0 && (
                          <span className="text-gray-500">· {company.regions[0]}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={`/companies/${company.slug}`}
                        onClick={() => handleClick(company.id, 'profile')}
                        className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        View Profile
                      </a>
                      <button
                        onClick={() => openQuoteModal(company)}
                        className="flex-1 text-center px-3 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-150 hover:brightness-105 hover:scale-[1.01]"
                        style={{ background: 'var(--rf-grad-red)' }}
                      >
                        Get Quote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar on mobile rail */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedAgencies;


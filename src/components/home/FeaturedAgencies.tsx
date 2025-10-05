/**
 * Featured Agencies v2 - Clean Text Cards, Perfect Alignment
 * No logos, Preferred first, identical card heights
 */

import { useState, useEffect } from 'react';

type CompanyCard = {
  id: string;
  slug: string;
  name: string;
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

const FeaturedAgencies = ({ companies, limit = 12 }: FeaturedAgenciesProps) => {
  const [impressionTracked, setImpressionTracked] = useState(false);

  // Separate by tier and sort
  const preferred = companies
    .filter((c) => c.tier === 'preferred')
    .sort((a, b) => {
      if ((b.rating_avg || 0) !== (a.rating_avg || 0)) {
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      }
      return (b.rating_count || 0) - (a.rating_count || 0);
    })
    .slice(0, 6);

  const partner = companies
    .filter((c) => c.tier === 'partner')
    .sort((a, b) => {
      if ((b.rating_avg || 0) !== (a.rating_avg || 0)) {
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      }
      return (b.rating_count || 0) - (a.rating_count || 0);
    })
    .slice(0, 6);

  const standard = companies
    .filter((c) => c.tier === 'standard')
    .sort((a, b) => {
      if ((b.rating_avg || 0) !== (a.rating_avg || 0)) {
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      }
      return (b.rating_count || 0) - (a.rating_count || 0);
    })
    .slice(0, 6);

  // Merge: preferred → partner → standard, deduplicate
  const mergedCompanies = (() => {
    const ids = new Set<string>();
    const result: CompanyCard[] = [];
    [preferred, partner, standard].forEach((group) => {
      group.forEach((c) => {
        if (!ids.has(c.id) && result.length < limit) {
          ids.add(c.id);
          result.push(c);
        }
      });
    });
    return result;
  })();

  useEffect(() => {
    // Track impression on first viewport
    if (!impressionTracked && typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if ((window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: 'home_featured_impression',
                ids: mergedCompanies.map((c) => c.id),
              });
            }
            setImpressionTracked(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );

      const section = document.getElementById('featured-agencies-v2');
      if (section) observer.observe(section);

      return () => observer.disconnect();
    }
  }, [mergedCompanies, impressionTracked]);

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
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

  return (
    <section
      id="featured-agencies-v2"
      className="py-16 bg-gradient-to-b from-white to-gray-50"
      aria-label="Featured relocation agencies"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
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

        {/* Preferred Partners Indicator */}
        {preferred.length > 0 && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
              ✓ {preferred.length} Preferred Partner{preferred.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mergedCompanies.map((company, index) => (
            <article
              key={company.id}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[240px]"
            >
              <meta itemProp="position" content={String(index + 1)} />
              <div itemProp="item" itemScope itemType="https://schema.org/Organization" className="flex-1 flex flex-col">
                {/* Top Content */}
                <div className="space-y-2 flex-1">
                  {/* Tier Badge */}
                  {company.tier !== 'standard' && (
                    <div className="mb-2">{getTierBadge(company.tier)}</div>
                  )}

                  {/* Company Name */}
                  <h3
                    className="text-[17px] font-semibold text-gray-900 leading-tight line-clamp-2"
                    itemProp="name"
                  >
                    {company.name}
                    {company.tier !== 'standard' && (
                      <span className="ml-1.5 text-green-600 text-sm">✓</span>
                    )}
                  </h3>
                  <link itemProp="url" href={`/companies/${company.slug}`} />

                  {/* Rating */}
                  {company.rating_avg ? (
                    <div className="text-sm text-gray-700 flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-gray-900">
                        {company.rating_avg.toFixed(1)}
                      </span>
                      {company.rating_count !== undefined && company.rating_count > 0 && (
                        <span className="text-gray-500">({company.rating_count})</span>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      New
                    </div>
                  )}

                  {/* Services & Region Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {company.services?.slice(0, 2).map((service, i) => (
                      <span
                        key={i}
                        className="inline-block px-2.5 py-0.5 bg-gray-50 text-gray-700 rounded-full text-xs border border-gray-200"
                      >
                        {service}
                      </span>
                    ))}
                    {company.regions && company.regions.length > 0 && (
                      <span className="text-xs text-gray-500">· {company.regions[0]}</span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions - Always Aligned */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                  <a
                    href={`/companies/${company.slug}`}
                    onClick={() => handleClick(company.id, 'profile')}
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-150"
                  >
                    View Profile
                  </a>
                  <button
                    onClick={() => openQuoteModal(company)}
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-white transition-all duration-150 hover:brightness-105 hover:scale-[1.01]"
                    style={{ background: 'var(--rf-grad-red)' }}
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Show More Preferred Link (if applicable) */}
        {preferred.length > 4 && (
          <div className="mt-6 text-center">
            <a
              href="/companies?tier=preferred"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#B61919] hover:underline"
            >
              See all {preferred.length} Preferred Partners
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAgencies;

/**
 * AlternativesList Component
 * Show alternative agencies
 */

import ReviewStars from './ReviewStars';
import AgencyStatusBadge from './AgencyStatusBadge';
import type { AgencyWithRelations, WeightedRating } from '../../lib/types/agencies';

interface AlternativesListProps {
  alternatives: Array<AgencyWithRelations & { rating?: WeightedRating }>;
  currentAgencyName: string;
}

export default function AlternativesList({ alternatives, currentAgencyName }: AlternativesListProps) {
  if (alternatives.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-2xl">
        <p className="text-gray-600">No alternatives available at the moment.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Alternatives to <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">{currentAgencyName}</span>
      </h2>
      <p className="text-gray-600 mb-8">
        Compare with other verified relocation agencies in Switzerland
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {alternatives.map((agency) => (
          <a
            key={agency.id}
            href={`/companies/${agency.slug}`}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 group-hover:text-[#FF6F61] transition-colors mb-1">
                  {agency.name}
                </h3>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  From Directory
                </span>
              </div>
              <AgencyStatusBadge status={agency.status} />
            </div>

            {/* Tagline */}
            {agency.tagline && (
              <p className="text-sm text-gray-600 mb-4">
                {agency.tagline}
              </p>
            )}

            {/* Rating */}
            {agency.rating && agency.rating.overall > 0 && (
              <div className="mb-4">
                <ReviewStars rating={agency.rating.overall} size="sm" />
                <p className="text-xs text-gray-500 mt-1">
                  Based on {agency.rating.internal_count + agency.rating.external_count} reviews
                </p>
              </div>
            )}

            {/* Services */}
            {agency.services && agency.services.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {agency.services.slice(0, 3).map((service) => (
                    <span
                      key={service.id}
                      className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {service.label.split('&')[0].trim()}
                    </span>
                  ))}
                  {agency.services.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{agency.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Regions */}
            {agency.regions && agency.regions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Coverage:</p>
                <div className="flex flex-wrap gap-1">
                  {agency.regions.slice(0, 3).map((region) => (
                    <span
                      key={region.id}
                      className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                    >
                      {region.label}
                    </span>
                  ))}
                  {agency.regions.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{agency.regions.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-[#FF6F61] group-hover:text-[#FF6F61] flex items-center gap-1">
                View Profile
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


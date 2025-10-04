/**
 * Rating Calculation Utilities
 * Weighted scoring: 60% internal + 40% external
 */

import type { Review, ExternalReviewSnapshot, WeightedRating } from './types/agencies';

const INTERNAL_WEIGHT = 0.6;
const EXTERNAL_WEIGHT = 0.4;

/**
 * Calculate weighted rating from internal reviews and external snapshots
 */
export function calculateWeightedRating(
  internalReviews: Review[],
  externalSnapshots: ExternalReviewSnapshot[]
): WeightedRating {
  // Calculate internal average
  const publishedReviews = internalReviews.filter(r => r.is_published);
  const internalCount = publishedReviews.length;
  const internalSum = publishedReviews.reduce((sum, r) => sum + r.rating, 0);
  const internalAvg = internalCount > 0 ? internalSum / internalCount : 0;

  // Calculate external average (use most recent snapshot per source)
  const latestBySource = new Map<string, ExternalReviewSnapshot>();
  externalSnapshots.forEach(snap => {
    const existing = latestBySource.get(snap.source);
    if (!existing || new Date(snap.captured_at) > new Date(existing.captured_at)) {
      latestBySource.set(snap.source, snap);
    }
  });

  const externalReviews = Array.from(latestBySource.values());
  const externalCount = externalReviews.reduce((sum, s) => sum + s.review_count, 0);
  
  // Weighted average of external sources
  let externalAvg = 0;
  if (externalCount > 0) {
    const weightedSum = externalReviews.reduce(
      (sum, s) => sum + (s.rating * s.review_count),
      0
    );
    externalAvg = weightedSum / externalCount;
  }

  // Calculate final weighted score
  let overall = 0;
  const hasInternal = internalCount > 0;
  const hasExternal = externalCount > 0;

  if (hasInternal && hasExternal) {
    // Both sources: apply weights
    overall = (internalAvg * INTERNAL_WEIGHT) + (externalAvg * EXTERNAL_WEIGHT);
  } else if (hasInternal) {
    // Only internal
    overall = internalAvg;
  } else if (hasExternal) {
    // Only external
    overall = externalAvg;
  }

  return {
    overall: Math.round(overall * 10) / 10, // Round to 1 decimal
    internal_avg: Math.round(internalAvg * 10) / 10,
    internal_count: internalCount,
    external_avg: Math.round(externalAvg * 10) / 10,
    external_count: externalCount,
  };
}

/**
 * Get star rating display (for rendering)
 */
export function getStarRating(rating: number): {
  full: number;
  half: boolean;
  empty: number;
} {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return { full, half: hasHalf, empty };
}

/**
 * Get rating color class
 */
export function getRatingColorClass(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-green-500';
  if (rating >= 3.5) return 'text-yellow-500';
  if (rating >= 3.0) return 'text-yellow-600';
  return 'text-orange-600';
}


/**
 * ReviewSummaryCard Component
 * AI-generated review summary with positives/negatives
 */

import type { ReviewSummary } from '../../lib/types/agencies';

interface ReviewSummaryCardProps {
  summary?: ReviewSummary;
}

export default function ReviewSummaryCard({ summary }: ReviewSummaryCardProps) {
  if (!summary) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Review Summary
        </h3>
        <p className="text-gray-600">
          Not enough reviews yet to generate a summary. Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900">
          AI-Powered Review Summary
        </h3>
      </div>

      {summary.summary && (
        <p className="text-gray-700 leading-relaxed mb-6">
          {summary.summary}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Positives */}
        {summary.positives && summary.positives.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strengths
            </h4>
            <ul className="space-y-2">
              {summary.positives.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negatives */}
        {summary.negatives && summary.negatives.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {summary.negatives.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-blue-200">
        This summary was automatically generated from user reviews using AI. Last updated {new Date(summary.updated_at).toLocaleDateString()}.
      </p>
    </div>
  );
}


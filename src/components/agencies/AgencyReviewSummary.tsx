/**
 * AI Review Summary Component - Brand Design System
 * Beautiful animated summary generation matching site design
 */

import { useState, useEffect } from 'react';

interface SummaryData {
  summary: string;
  positives: string[];
  negatives: string[];
  internal_review_count: number;
  external_review_count: number;
  weighted_rating: number;
  last_generated_at: string;
}

interface AgencyReviewSummaryProps {
  relocatorId: string;
  relocatorName: string;
  existingSummary?: SummaryData | null;
}

type LoadingStep = {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
};

export default function AgencyReviewSummary({
  relocatorId,
  relocatorName,
  existingSummary,
}: AgencyReviewSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBanner, setShowBanner] = useState(!existingSummary);
  const [summary, setSummary] = useState(existingSummary);
  const [error, setError] = useState<string | null>(null);
  
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 'fetch', label: 'Fetching all reviews...', icon: '📚', completed: false },
    { id: 'analyze', label: 'Analyzing feedback patterns...', icon: '🔍', completed: false },
    { id: 'calculate', label: 'Calculating weighted ratings...', icon: '⭐', completed: false },
    { id: 'themes', label: 'Identifying key themes...', icon: '💡', completed: false },
    { id: 'generate', label: 'Generating summary...', icon: '✨', completed: false },
  ]);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isGenerating && currentStepIndex < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingSteps(prev => 
          prev.map((step, idx) => 
            idx === currentStepIndex ? { ...step, completed: true } : step
          )
        );
        setCurrentStepIndex(prev => prev + 1);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, currentStepIndex, loadingSteps.length]);

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentStepIndex(0);
    setLoadingSteps(prev => prev.map(s => ({ ...s, completed: false })));

    try {
      await new Promise(resolve => setTimeout(resolve, loadingSteps.length * 800 + 500));

      const response = await fetch(
        `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/generate-ai-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ relocator_id: relocatorId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      setShowBanner(false);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Unable to generate summary. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (showBanner && !isGenerating) {
    return (
      <div class="bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl p-8 lg:p-10 border-2 border-primary-200 relative overflow-hidden shadow-sm">
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-0 left-0 w-32 h-32 bg-primary-400 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-primary-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        </div>

        <div class="relative z-10">
          <div class="flex items-start gap-4 mb-6">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-2xl">✨</span>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                AI-Powered Review Analysis
              </h3>
              <p class="text-gray-700 leading-relaxed">
                Get an intelligent summary of all reviews for <strong>{relocatorName}</strong>. 
                Our AI analyzes feedback from multiple sources to give you key insights, 
                strengths, and areas to consider.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={generateSummary}
              class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Generate AI Summary
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
            <div class="text-sm text-gray-600">
              <span class="inline-block px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                ⚡ Takes ~5 seconds
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div class="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200 shadow-sm">
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl mb-4 animate-pulse shadow-lg">
              <span class="text-3xl">🤖</span>
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Analyzing Reviews for {relocatorName}
            </h3>
            <p class="text-gray-600">
              Please wait while our AI processes all available feedback...
            </p>
          </div>

          <div class="space-y-4">
            {loadingSteps.map((step, index) => (
              <div
                key={step.id}
                class={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 border-2 ${
                  step.completed
                    ? 'bg-green-50 border-green-200'
                    : index === currentStepIndex
                    ? 'bg-primary-50 border-primary-200 scale-105 shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div class={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  step.completed
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-primary-600 animate-spin'
                    : 'bg-gray-300'
                }`}>
                  {step.completed ? (
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : index === currentStepIndex ? (
                    <div class="w-5 h-5 border-3 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <span class="text-xl">{step.icon}</span>
                  )}
                </div>
                <div class="flex-1">
                  <p class={`font-medium ${
                    step.completed
                      ? 'text-green-800'
                      : index === currentStepIndex
                      ? 'text-primary-800'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div class="mt-8 text-center">
            <div class="inline-flex items-center gap-2 text-sm text-gray-500">
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              Processing...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-red-900 mb-1">Error</h4>
            <p class="text-red-800">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setShowBanner(true);
              }}
              class="mt-4 text-sm text-red-700 hover:text-red-900 font-medium underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div class="bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl p-8 lg:p-10 border border-gray-200 shadow-sm">
      {/* Header */}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-xl">🤖</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              AI Review Summary
            </h3>
            <p class="text-sm text-gray-600">
              Based on {summary.internal_review_count + summary.external_review_count} reviews
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(true)}
          class="px-4 py-2 text-sm text-primary-700 hover:text-primary-900 font-medium border border-primary-300 rounded-lg hover:bg-white transition-colors"
        >
          ↻ Regenerate
        </button>
      </div>

      {/* Overall Summary */}
      <div class="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p class="text-gray-800 leading-relaxed text-lg">
          {summary.summary}
        </p>
      </div>

      {/* Rating Overview */}
      <div class="grid sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <p class="text-sm text-gray-600 mb-1">Weighted Rating</p>
          <div class="flex items-center gap-2">
            <span class="text-3xl font-bold text-gray-900">
              {summary.weighted_rating.toFixed(1)}
            </span>
            <span class="text-yellow-500 text-2xl">⭐</span>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <p class="text-sm text-gray-600 mb-1">Platform Reviews</p>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold text-primary-600">
              {summary.internal_review_count}
            </span>
            <span class="text-sm text-gray-500">reviews</span>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <p class="text-sm text-gray-600 mb-1">External Sources</p>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold text-green-600">
              {summary.external_review_count}
            </span>
            <span class="text-sm text-gray-500">reviews</span>
          </div>
        </div>
      </div>

      {/* Strengths & Considerations */}
      <div class="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {summary.positives && summary.positives.length > 0 && (
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="font-bold text-green-900 text-lg">Key Strengths</h4>
            </div>
            <ul class="space-y-3">
              {summary.positives.map((positive, idx) => (
                <li key={idx} class="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <span class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    ✓
                  </span>
                  <span class="text-gray-700 flex-1">{positive}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Consider */}
        {summary.negatives && summary.negatives.length > 0 && (
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 class="font-bold text-orange-900 text-lg">Areas to Consider</h4>
            </div>
            <ul class="space-y-3">
              {summary.negatives.map((negative, idx) => (
                <li key={idx} class="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100">
                  <span class="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    !
                  </span>
                  <span class="text-gray-700 flex-1">{negative}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-xs text-gray-500 text-center">
          This summary was automatically generated from verified reviews on {new Date(summary.last_generated_at).toLocaleDateString()}.
          It combines insights from platform reviews (60% weight) and external sources (40% weight).
        </p>
      </div>
    </div>
  );
}


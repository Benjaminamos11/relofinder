/**
 * AI Review Summary Component with Loading Animation
 * Beautiful summary generation with step-by-step progress
 */

import { useState, useEffect } from 'react';

interface AISummaryProps {
  relocatorId: string;
  relocatorName: string;
  existingSummary?: {
    summary: string;
    positives: string[];
    negatives: string[];
    internal_review_count: number;
    external_review_count: number;
    weighted_rating: number;
    last_generated_at: string;
  } | null;
}

type LoadingStep = {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
};

export default function AIReviewSummary({ relocatorId, relocatorName, existingSummary }: AISummaryProps) {
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
      }, 800); // Each step takes 800ms
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, currentStepIndex, loadingSteps.length]);

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentStepIndex(0);
    setLoadingSteps(prev => prev.map(s => ({ ...s, completed: false })));

    try {
      // Wait for animation to complete
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI-Powered Review Analysis
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Get an intelligent summary of all reviews for <strong>{relocatorName}</strong>. 
                Our AI analyzes feedback from multiple sources to give you key insights, 
                strengths, and areas to consider.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={generateSummary}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Generate AI Summary
            </button>
            <div className="text-sm text-gray-600">
              <span className="inline-block px-3 py-1 bg-white rounded-full border border-gray-200">
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
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 animate-pulse">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Reviews for {relocatorName}
            </h3>
            <p className="text-gray-600">
              Please wait while our AI processes all available feedback...
            </p>
          </div>

          <div className="space-y-4">
            {loadingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  step.completed
                    ? 'bg-green-50 border-green-200'
                    : index === currentStepIndex
                    ? 'bg-blue-50 border-blue-200 scale-105'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                } border-2`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-blue-500 animate-spin'
                    : 'bg-gray-300'
                }`}>
                  {step.completed ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : index === currentStepIndex ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.completed
                      ? 'text-green-800'
                      : index === currentStepIndex
                      ? 'text-blue-800'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Processing...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-900 mb-1">Error</h4>
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setShowBanner(true);
              }}
              className="mt-4 text-sm text-red-700 hover:text-red-900 font-medium underline"
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
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              AI Review Summary
            </h3>
            <p className="text-sm text-gray-600">
              Based on {summary.internal_review_count + summary.external_review_count} reviews
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(true)}
          className="px-4 py-2 text-sm text-blue-700 hover:text-blue-900 font-medium border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
        >
          ↻ Regenerate
        </button>
      </div>

      {/* Overall Summary */}
      <div className="mb-8 p-6 bg-white rounded-xl border border-blue-100">
        <p className="text-gray-800 leading-relaxed text-lg">
          {summary.summary}
        </p>
      </div>

      {/* Rating Overview */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Weighted Rating</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {summary.weighted_rating.toFixed(1)}
            </span>
            <span className="text-yellow-500 text-2xl">⭐</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Platform Reviews</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {summary.internal_review_count}
            </span>
            <span className="text-sm text-gray-500">reviews</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">External Sources</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">
              {summary.external_review_count}
            </span>
            <span className="text-sm text-gray-500">reviews</span>
          </div>
        </div>
      </div>

      {/* Strengths & Considerations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {summary.positives && summary.positives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-green-900 text-lg">Key Strengths</h4>
            </div>
            <ul className="space-y-3">
              {summary.positives.map((positive, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-gray-700 flex-1">{positive}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Consider */}
        {summary.negatives && summary.negatives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="font-bold text-orange-900 text-lg">Areas to Consider</h4>
            </div>
            <ul className="space-y-3">
              {summary.negatives.map((negative, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    !
                  </span>
                  <span className="text-gray-700 flex-1">{negative}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-blue-200">
        <p className="text-xs text-gray-500 text-center">
          This summary was automatically generated from verified reviews on {new Date(summary.last_generated_at).toLocaleDateString()}.
          It combines insights from platform reviews (60% weight) and external sources (40% weight).
        </p>
      </div>
    </div>
  );
}


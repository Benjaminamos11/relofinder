/**
 * Multi-Step Review Form
 * Step 1: Rating → Step 2: Service → Step 3: Details → Step 4: Submit
 */

import { useState } from 'react';

interface ReviewFormProps {
  relocatorId: string;
  relocatorName: string;
}

type Step = 1 | 2 | 3 | 4;

const SERVICES = [
  { code: 'housing', label: 'Housing & Real Estate', icon: '🏠' },
  { code: 'immigration', label: 'Visa & Immigration', icon: '📄' },
  { code: 'finance', label: 'Banking & Finance', icon: '💰' },
  { code: 'advisory', label: 'Advisory Services', icon: '💼' },
  { code: 'education', label: 'Education & Schools', icon: '🎓' },
  { code: 'settling_in', label: 'Settling-In Support', icon: '✨' },
];

export default function ReviewForm({ relocatorId, relocatorName }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    rating: 0,
    service_used: '',
    title: '',
    text: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setStep(1);
    setFormData({ rating: 0, service_used: '', title: '', text: '' });
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/submit-review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            relocator_id: relocatorId,
            rating: formData.rating,
            text: formData.text,
            title: formData.title || null,
            service_code: formData.service_used || null,
            status: 'pending', // Manual moderation
          }),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        ✍️ Write a Review
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-green-300 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">
            Your review has been submitted and will be published after verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Review {relocatorName}
        </h3>
        <button
          onClick={() => {
            setIsOpen(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full flex-1 transition-all ${
              step >= s ? 'bg-red-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Rating */}
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-lg font-medium text-gray-900">
            How would you rate your experience?
          </p>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => {
                  setFormData({ ...formData, rating });
                  setStep(2);
                }}
                className={`py-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                  formData.rating === rating
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating}<br/>⭐
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Service */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-lg font-medium text-gray-900">
            Which service did you use?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((service) => (
              <button
                key={service.code}
                onClick={() => {
                  setFormData({ ...formData, service_used: service.code });
                  setStep(3);
                }}
                className={`p-4 rounded-xl font-medium text-left transition-all hover:scale-105 ${
                  formData.service_used === service.code
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl mb-2 block">{service.icon}</span>
                <span className="text-sm">{service.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              placeholder="Share details about your experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

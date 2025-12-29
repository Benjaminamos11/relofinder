/**
 * ContactPanel Component
 * Conditional contact form based on agency tier
 */

import { useState } from 'react';
import type { Agency } from '../../lib/types/agencies';

interface ContactPanelProps {
  agency: Agency;
  sourcePage?: string;
}

export default function ContactPanel({ agency, sourcePage }: ContactPanelProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          agency_id: agency.id,
          source_page: sourcePage || window.location.pathname,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error('Error submitting lead:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Standard tier: no direct contact
  if (agency.status === 'standard') {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Contact {agency.name}
        </h3>
        <p className="text-gray-600 mb-6">
          This is a standard listing. To get personalized quotes and compare multiple providers, use our comparison tool.
        </p>
        <a
          href="/companies?region=zurich"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
        >
          Compare Providers
        </a>
      </div>
    );
  }

  // Partner & Preferred: show contact form
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Contact {agency.name}
      </h3>
      <p className="text-gray-600 mb-6">
        {agency.status === 'preferred' 
          ? 'Get a personalized consultation with our preferred partner.'
          : 'Reach out directly to this verified partner.'}
      </p>

      {/* Contact details */}
      {(agency.phone || agency.email || agency.website_url) && (
        <div className="mb-6 space-y-2">
          {agency.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${agency.phone}`} className="hover:text-[#FF6F61]">
                {agency.phone}
              </a>
            </div>
          )}
          {agency.email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${agency.email}`} className="hover:text-[#FF6F61]">
                {agency.email}
              </a>
            </div>
          )}
          {agency.website_url && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a href={agency.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6F61]">
                Visit Website
              </a>
            </div>
          )}
        </div>
      )}

      {/* Meeting CTA for preferred */}
      {agency.status === 'preferred' && agency.meeting_url && (
        <a
          href={agency.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Schedule a Meeting
        </a>
      )}

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
            placeholder="Tell us about your relocation needs..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Contact Agency'}
        </button>

        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            Thank you! Your message has been sent successfully.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-[#FF6F61]/5 border border-red-200 rounded-lg text-red-800 text-sm">
            Something went wrong. Please try again or contact us directly.
          </div>
        )}
      </form>
    </div>
  );
}


/**
 * ContactModal Component
 * Context-aware modal for quote requests and consultation bookings
 * Follows Swiss minimalism: white surfaces, soft shadows, red gradient CTAs only
 */

import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ContextType =
  | { type: "service"; serviceName: string }
  | { type: "region"; regionName: string }
  | { type: "profile"; companyName: string; companyId: string }
  | { type: "home" };

export type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  context: ContextType;
  defaultMode?: "quotes" | "consultation";
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  movingFrom: string;
  movingTo: string;
  moveDate: string;
  reason: string;
  reasonOther: string;
  services: string[];
  servicesOther: string;
  emailOnly: boolean;
  notes: string;
  honeypot: string; // Anti-spam
};

type SocialProof = {
  matchesThisMonth: number;
  bookingsToday: number;
};

// ============================================================================
// Copy Dictionary
// ============================================================================

const COPY = {
  labels: {
    name: "Full Name",
    email: "Email",
    phone: "Phone (optional)",
    from: "Moving from",
    to: "Moving to (Swiss city/canton)",
    date: "Planned move date",
    reason: "Reason for move",
    services: "Services needed",
    notes: "Notes (optional)",
    emailOnly: "I prefer to be contacted via email only",
  },
  reasons: [
    "Job offer / Work transfer",
    "Study",
    "Family reunion",
    "Retirement",
    "Tax relocation",
    "Other"
  ],
  services: [
    { id: "home_search", label: "Home Search" },
    { id: "permits", label: "Registration / Permits" },
    { id: "schools", label: "School Support" },
    { id: "temporary", label: "Temporary Accommodation" },
    { id: "settling_in", label: "Settling-In" },
    { id: "departure", label: "Departure" },
    { id: "other", label: "Other" },
  ],
  trust: "We forward your request only to verified agencies. Expect 3–5 tailored proposals within 24–48 hours.",
  legal: "GDPR compliant. No hidden fees or commissions.",
  corporate: "Corporate client? Request an anonymous quote →",
  bookedToday: (n: number) => `Today, ${n} people booked a consultation.`,
  matchesThisMonth: (n: number) => `✅ ${n} successful matches this month`,
};

// ============================================================================
// Dynamic Copy Generator
// ============================================================================

function getModalCopy(context: ContextType, mode: "quotes" | "consultation") {
  switch (context.type) {
    case "service":
      return {
        headline: `Get Tailored Quotes for ${context.serviceName}`,
        subtext: `We'll match you with up to 5 verified Swiss relocation experts specializing in ${context.serviceName.toLowerCase()}.`,
        ctaQuotes: "Compare 3–5 Quotes",
        ctaConsultation: "Book Consultation",
      };
    
    case "region":
      return {
        headline: `Find a Trusted ${context.regionName} Relocation Expert`,
        subtext: `Receive transparent offers from top-rated agencies in ${context.regionName}.`,
        ctaQuotes: `Get My ${context.regionName} Quotes`,
        ctaConsultation: "Book Consultation",
      };
    
    case "profile":
      return {
        headline: `Book a Consultation with ${context.companyName}`,
        subtext: `Speak directly with ${context.companyName} about your move and next steps.`,
        ctaQuotes: "Compare with Other Agencies",
        ctaConsultation: "Book Consultation",
      };
    
    case "home":
    default:
      return {
        headline: "Find the Right Swiss Relocation Partner",
        subtext: "Compare services and pricing from verified specialists — no hidden fees.",
        ctaQuotes: "Get 3–5 Quotes",
        ctaConsultation: "Book Consultation",
      };
  }
}

// ============================================================================
// ContactModal Component
// ============================================================================

export const ContactModal: FC<ContactModalProps> = ({
  isOpen,
  onClose,
  context,
  defaultMode,
}) => {
  // Determine default mode based on context
  const initialMode = defaultMode || (context.type === "profile" ? "consultation" : "quotes");
  
  const [mode, setMode] = useState<"quotes" | "consultation">(initialMode);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    movingFrom: "",
    movingTo: "",
    moveDate: "",
    reason: "",
    reasonOther: "",
    services: [],
    servicesOther: "",
    emailOnly: false,
    notes: "",
    honeypot: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [socialProof, setSocialProof] = useState<SocialProof>({
    matchesThisMonth: 156,
    bookingsToday: 12,
  });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const formStartTime = useRef<number>(Date.now());
  
  // Get dynamic copy
  const copy = getModalCopy(context, mode);
  
  // Fetch social proof data
  useEffect(() => {
    if (isOpen) {
      fetchSocialProof();
      formStartTime.current = Date.now();
    }
  }, [isOpen]);
  
  // Focus trap and ESC handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, onClose]);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Analytics
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'modal_open',
        context: context,
      });
    }
  }, [isOpen, context]);
  
  const handleModeSwitch = (newMode: "quotes" | "consultation") => {
    if (mode === newMode) return;
    
    setMode(newMode);
    
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'switch_mode',
        from: mode,
        to: newMode,
      });
    }
  };
  
  const fetchSocialProof = async () => {
    try {
      const response = await fetch('/api/social-proof');
      if (response.ok) {
        const data = await response.json();
        setSocialProof(data);
      }
    } catch (error) {
      console.error('Failed to fetch social proof:', error);
      // Keep fallback values
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.movingFrom.trim()) {
      newErrors.movingFrom = "Please specify where you're moving from";
    }
    
    if (!formData.movingTo.trim()) {
      newErrors.movingTo = "Please specify your Swiss destination";
    }
    
    if (!formData.moveDate.trim()) {
      newErrors.moveDate = "Move date is required";
    }
    
    if (!formData.reason) {
      newErrors.reason = "Please select a reason";
    }
    
    if (formData.reason === "Other" && !formData.reasonOther.trim()) {
      newErrors.reasonOther = "Please specify your reason";
    }
    
    if (formData.services.length === 0) {
      newErrors.services = "Please select at least one service";
    }
    
    if (formData.services.includes("other") && !formData.servicesOther.trim()) {
      newErrors.servicesOther = "Please specify the service";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Anti-spam checks
    if (formData.honeypot) {
      console.warn('Honeypot triggered');
      return;
    }
    
    const timeTaken = Date.now() - formStartTime.current;
    if (timeTaken < 3000) {
      console.warn('Form submitted too quickly');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'lead_submit_started',
        mode,
        context,
      });
    }
    
    try {
      const payload = {
        mode,
        context,
        contact: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          contact_pref: formData.emailOnly ? 'email' : null,
        },
        move: {
          from: formData.movingFrom,
          to: formData.movingTo,
          date: formData.moveDate,
          reason: formData.reason === "Other" ? formData.reasonOther : formData.reason,
        },
        services: formData.services.map(s => 
          s === "other" ? formData.servicesOther : s
        ),
        notes: formData.notes || null,
        source_context: {
          ...context,
          path: window.location.pathname,
          ua: navigator.userAgent,
        },
      };
      
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
      
      const result = await response.json();
      
      setSubmitSuccess(true);
      
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'lead_submit_success',
          mode,
          context,
          id: result.id,
        });
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'lead_submit_error',
          mode,
          context,
          error_code: error instanceof Error ? error.message : 'unknown',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId],
    }));
    
    if (errors.services) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.services;
        return newErrors;
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {submitSuccess ? (
          // Success View
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
            <p className="text-gray-600 mb-6">
              We've notified the right agencies. Expect {mode === "quotes" ? "3–5 proposals" : "a response"} within 24–48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
              <a
                href="/swiss-relocation-guide"
                className="px-6 py-3 text-gray-700 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200"
              >
                View Relocation Tips
              </a>
            </div>
          </div>
        ) : (
          // Form View
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 id="modal-headline" className="text-2xl font-bold text-gray-900 pr-8">
                  {copy.headline}
                </h1>
                <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">
                  {COPY.matchesThisMonth(socialProof.matchesThisMonth)}
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {copy.subtext}
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => handleModeSwitch("quotes")}
                className={`px-6 py-3 font-semibold text-sm transition-all duration-150 border-b-2 ${
                  mode === "quotes"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Quotes
              </button>
              <button
                onClick={() => handleModeSwitch("consultation")}
                className={`px-6 py-3 font-semibold text-sm transition-all duration-150 border-b-2 ${
                  mode === "consultation"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Consultation
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                value={formData.honeypot}
                onChange={(e) => handleInputChange('honeypot', e.target.value)}
                style={{ position: 'absolute', left: '-9999px' }}
                tabIndex={-1}
                autoComplete="off"
              />
              
              {/* Step 1: Your Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">Step 1 — Your Details</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.labels.name} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {COPY.labels.email} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {COPY.labels.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              {/* Step 2: Move Details */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Step 2 — Move Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="movingFrom" className="block text-sm font-medium text-gray-700 mb-1">
                      {COPY.labels.from} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="movingFrom"
                      value={formData.movingFrom}
                      onChange={(e) => handleInputChange('movingFrom', e.target.value)}
                      placeholder="e.g. London, UK"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.movingFrom ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.movingFrom && <p className="mt-1 text-xs text-red-600">{errors.movingFrom}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="movingTo" className="block text-sm font-medium text-gray-700 mb-1">
                      {COPY.labels.to} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="movingTo"
                      value={formData.movingTo}
                      onChange={(e) => handleInputChange('movingTo', e.target.value)}
                      placeholder="e.g. Zurich"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.movingTo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.movingTo && <p className="mt-1 text-xs text-red-600">{errors.movingTo}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.labels.date} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="month"
                    id="moveDate"
                    value={formData.moveDate}
                    onChange={(e) => handleInputChange('moveDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                      errors.moveDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.moveDate && <p className="mt-1 text-xs text-red-600">{errors.moveDate}</p>}
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.labels.reason} <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                      errors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a reason</option>
                    {COPY.reasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
                </div>
                
                {formData.reason === "Other" && (
                  <div>
                    <input
                      type="text"
                      value={formData.reasonOther}
                      onChange={(e) => handleInputChange('reasonOther', e.target.value)}
                      placeholder="Please specify"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.reasonOther ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.reasonOther && <p className="mt-1 text-xs text-red-600">{errors.reasonOther}</p>}
                  </div>
                )}
              </div>
              
              {/* Step 3: Services Needed */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Step 3 — {COPY.labels.services} <span className="text-red-600">*</span>
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {COPY.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                        formData.services.includes(service.id)
                          ? 'bg-red-100 text-red-700 border-2 border-red-600'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
                
                {errors.services && <p className="text-xs text-red-600">{errors.services}</p>}
                
                {formData.services.includes("other") && (
                  <div>
                    <input
                      type="text"
                      value={formData.servicesOther}
                      onChange={(e) => handleInputChange('servicesOther', e.target.value)}
                      placeholder="Please specify the service"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.servicesOther ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.servicesOther && <p className="mt-1 text-xs text-red-600">{errors.servicesOther}</p>}
                  </div>
                )}
              </div>
              
              {/* Step 4: Preferences */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Step 4 — Preferences</h3>
                
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailOnly}
                      onChange={(e) => handleInputChange('emailOnly', e.target.checked)}
                      className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{COPY.labels.emailOnly}</span>
                  </label>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.labels.notes}
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    mode === "quotes" ? copy.ctaQuotes : copy.ctaConsultation
                  )}
                </button>
                
                {submitError && (
                  <p className="mt-2 text-sm text-red-600 text-center">{submitError}</p>
                )}
                
                {/* Urgency Note */}
                <p className="mt-2 text-xs text-gray-500 text-center">
                  {COPY.bookedToday(socialProof.bookingsToday)}
                </p>
              </div>
              
              {/* Consultation Callout - Only show in Quotes mode */}
              {mode === "quotes" && (
                <div className="mt-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    Prefer personal guidance?
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Schedule a free consultation with one of our verified experts.
                  </p>
                  <a
                    href="/consultation"
                    onClick={(e) => {
                      e.preventDefault();
                      if (typeof window !== 'undefined' && (window as any).dataLayer) {
                        (window as any).dataLayer.push({
                          event: 'consultation_cta_click',
                          context: context,
                          target: '/consultation',
                        });
                      }
                      window.location.href = '/consultation';
                    }}
                    className="inline-block w-full px-6 py-3 bg-white text-red-600 font-semibold rounded-full border-2 border-red-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white transition-all duration-200"
                  >
                    Book a Free Consultation →
                  </a>
                  <p className="mt-2 text-xs text-gray-500">
                    All consultations are with licensed Swiss relocation specialists.
                  </p>
                </div>
              )}
              
              {/* Trust Line */}
              <div className="text-xs text-gray-600 text-center space-y-1 pt-4">
                <p>{COPY.trust}</p>
                <p className="text-gray-500">{COPY.legal}</p>
              </div>
              
              {/* Corporate Link */}
              <div className="text-center pt-2">
                <a
                  href="/corporate"
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).dataLayer) {
                      (window as any).dataLayer.push({
                        event: 'corporate_link_click',
                      });
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
                >
                  {COPY.corporate}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;


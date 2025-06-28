import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isModalOpen, modalContext, type ModalContext } from '../../stores/modal';

// Swiss cities for autocomplete
const SWISS_CITIES = [
  'Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen',
  'Lugano', 'Biel/Bienne', 'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Fribourg',
  'Chur', 'Neuchâtel', 'Uster', 'Sion', 'Emmen', 'Zug', 'Yverdon-les-Bains', 'Dübendorf',
  'Dietikon', 'Montreux', 'Frauenfeld', 'Wetzikon', 'Rapperswil-Jona', 'Carouge'
];

// Timeline options
const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'ASAP (Within 1 month)', icon: '⚡' },
  { value: '1-3months', label: '1-3 months', icon: '📅' },
  { value: '3-6months', label: '3-6 months', icon: '🗓️' },
  { value: '6-12months', label: '6-12 months', icon: '📆' },
  { value: '12+months', label: '12+ months', icon: '⏰' },
  { value: 'flexible', label: 'Flexible timeline', icon: '🤝' }
];

// Priority options
const PRIORITY_OPTIONS = [
  { id: 'housing', label: 'Housing & Accommodation', icon: '🏠' },
  { id: 'visa', label: 'Visa & Work Permits', icon: '📋' },
  { id: 'schools', label: 'Schools & Education', icon: '🎓' },
  { id: 'banking', label: 'Banking & Finance', icon: '🏦' },
  { id: 'healthcare', label: 'Healthcare & Insurance', icon: '🏥' },
  { id: 'transport', label: 'Transportation', icon: '🚗' },
  { id: 'culture', label: 'Cultural Integration', icon: '🌍' },
  { id: 'legal', label: 'Legal Services', icon: '⚖️' }
];

// Service flow options - premium design
const SERVICE_FLOWS = {
  quotes: {
    title: 'Custom Quotes',
    description: 'Get personalized quotes from verified Swiss relocation specialists',
    benefits: [
      'Compare 3-5 tailored proposals',
      'Transparent pricing breakdown',
      'Direct specialist contact',
      'No hidden fees or commissions'
    ],
    cta: 'Get My Quotes',
    timeframe: '24-48 hours',
    icon: '💼'
  },
  session: {
    title: 'Expert Consultation',
    description: 'Schedule a free 30-minute session with Robert Kolar',
    benefits: [
      'Personalized relocation roadmap',
      'Expert answers to your questions',
      'Specialist recommendations',
      'Priority planning guidance'
    ],
    cta: 'Book Free Session',
    timeframe: 'Same day',
    icon: '🎯'
  },
  match: {
    title: 'Instant Match',
    description: 'AI-powered matching with the perfect relocation specialist',
    benefits: [
      'Instant compatibility scoring',
      'Pre-qualified specialists only',
      'Location-specific expertise',
      'Fast-track introduction'
    ],
    cta: 'Find My Match',
    timeframe: '60 seconds',
    icon: '⚡'
  }
};

interface FormData {
  firstName: string;
  destination: string;
  timeline: string;
  priorities: string[];
  email: string;
  phone: string;
  selectedFlow: 'quotes' | 'session' | 'match';
}

interface ModalContentProps {
  headline?: string;
  subheadline?: string;
  successBadge?: string;
  eligibilityNotice?: string;
}

const UniversalContactModal: React.FC<ModalContentProps> = ({
  headline = "Find the Right Swiss Relocation Specialist",
  subheadline = "We help expats and HR teams compare the best Swiss relocation services – for every move, every budget.",
  successBadge = "156 successful matches this month",
  eligibilityNotice = "Note: We do not provide job search assistance or direct relocation services. Our mission is to help you find and compare the right relocation providers in Switzerland."
}) => {

  const modalOpen = useStore(isModalOpen);
  const context = useStore(modalContext);
  
  // Local modal control functions
  const openModalWithContext = (ctx: ModalContext) => {
    modalContext.set(ctx);
    isModalOpen.set(true);
  };
  
  const closeModal = () => {
    isModalOpen.set(false);
  };
  
  // Listen for global modal events
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      openModalWithContext(event.detail || {});
    };
    
    const handleCloseModal = () => {
      closeModal();
    };
    
    window.addEventListener('openModal', handleOpenModal as EventListener);
    window.addEventListener('closeModal', handleCloseModal);
    
    // Process any queued modal events now that we're ready
    if (typeof (window as any).processModalQueue === 'function') {
      (window as any).processModalQueue();
    }
    
    return () => {
      window.removeEventListener('openModal', handleOpenModal as EventListener);
      window.removeEventListener('closeModal', handleCloseModal);
      // Mark modal as not ready when component unmounts
      (window as any).modalReady = false;
    };
  }, []);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    destination: '',
    timeline: '',
    priorities: [],
    email: '',
    phone: '',
    selectedFlow: 'quotes'
  });
  const [cityFilter, setCityFilter] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  // Generate dynamic content based on context
  const getContextualContent = (context: ModalContext) => {
    const baseContent = {
      headline: headline,
      subheadline: subheadline,
      successBadge: successBadge
    };

    switch (context.page) {
      case 'blog':
        return {
          headline: `Ready to Apply This ${context.topic || 'Guide'}?`,
          subheadline: "Connect with experts who can help you implement these insights",
          successBadge: "89 readers got expert help this week"
        };
      case 'service':
        return {
          headline: `Find ${context.service || 'Relocation'} Specialists`,
          subheadline: "Connect with verified experts in this service area",
          successBadge: "156 successful matches this month"
        };
      case 'corporate':
        return {
          headline: "Enterprise Relocation Solutions",
          subheadline: "Streamlined services for employee relocations",
          successBadge: "42 companies upgraded their relocation program"
        };
      case 'region':
        return {
          headline: `${context.region || 'Swiss'} Relocation Experts`,
          subheadline: "Local specialists with deep regional knowledge",
          successBadge: "73 families relocated successfully this month"
        };
      default:
        return baseContent;
    }
  };

  const contextContent = getContextualContent(context);

  // Filter cities based on input
  useEffect(() => {
    if (cityFilter) {
      const filtered = SWISS_CITIES.filter(city =>
        city.toLowerCase().includes(cityFilter.toLowerCase())
      ).slice(0, 6);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [cityFilter]);

  // Reset form when modal opens
  useEffect(() => {
    if (modalOpen) {
      setCurrentStep(0);
      setIsSuccess(false);
      setIsSubmitting(false);
      setFormData({
        firstName: '',
        destination: '',
        timeline: '',
        priorities: [],
        email: '',
        phone: '',
        selectedFlow: 'quotes'
      });
    }
  }, [modalOpen]);

  const handleClose = () => {
    closeModal();
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFlowSelect = (flow: 'quotes' | 'session' | 'match') => {
    setFormData({ ...formData, selectedFlow: flow });
  };

  const handlePriorityToggle = (priorityId: string) => {
    const newPriorities = formData.priorities.includes(priorityId)
      ? formData.priorities.filter(p => p !== priorityId)
      : [...formData.priorities, priorityId];
    setFormData({ ...formData, priorities: newPriorities });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/mwplkpey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          context,
          timestamp: new Date().toISOString(),
          source: 'Universal Contact Modal'
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setCurrentStep(5); // Success step
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / 6) * 100;
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-gray-100">
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div 
            className="h-2 bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-500 rounded-full"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">
                {contextContent.headline}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">{contextContent.subheadline}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-3 hover:bg-gray-100 rounded-full"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Success Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full text-sm text-emerald-700 font-medium mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
            ✅ {contextContent.successBadge}
          </div>

          {/* Eligibility Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 leading-relaxed">{eligibilityNotice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 pb-8">
          {currentStep === 0 && (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left: Service Selection (3 columns) */}
              <div className="lg:col-span-3">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Path</h3>
                
                {/* Service Flow Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl">
                  {Object.entries(SERVICE_FLOWS).map(([key, flow]) => (
                    <button
                      key={key}
                      onClick={() => handleFlowSelect(key as 'quotes' | 'session' | 'match')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        formData.selectedFlow === key
                          ? 'bg-white text-gray-900 shadow-md border border-gray-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>{flow.icon}</span>
                        <span>{flow.title}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Service Details Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">{SERVICE_FLOWS[formData.selectedFlow].icon}</span>
                      <h4 className="text-xl font-bold text-gray-900">
                        {SERVICE_FLOWS[formData.selectedFlow].title}
                      </h4>
                    </div>
                    <p className="text-gray-600 text-base mb-4 leading-relaxed">
                      {SERVICE_FLOWS[formData.selectedFlow].description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      ⏱️ Response time: {SERVICE_FLOWS[formData.selectedFlow].timeframe}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {SERVICE_FLOWS[formData.selectedFlow].benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {SERVICE_FLOWS[formData.selectedFlow].cta} →
                  </button>
                </div>
              </div>

              {/* Right: Robert Kolar Profile (2 columns) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-fit">
                  <div className="text-center">
                    {/* Large Profile Photo */}
                    <div className="relative mb-6">
                      <img
                        src="https://res.cloudinary.com/dphbnwjtx/image/upload/v1747501071/6758848048b5cdaf6ebe884f_WhatsApp_Image_2024-12-11_at_01.55.01_oruhjs.webp"
                        alt="Robert Kolar - Swiss Relocation Expert"
                        className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg border-4 border-white"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Robert Kolar</h4>
                    <p className="text-gray-600 mb-2">Chief Relocation Expert</p>
                    <p className="text-sm text-gray-500 mb-6">Chief Cow Whisperer 🐄</p>
                    
                    {/* Language Badges */}
                    <div className="flex justify-center flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 rounded-full border border-gray-200 font-medium">🇩🇪 German</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 rounded-full border border-gray-200 font-medium">🇬🇧 English</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 rounded-full border border-gray-200 font-medium">🇫🇷 French</span>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">500+</div>
                        <div className="text-xs text-gray-600">Relocations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">10+</div>
                        <div className="text-xs text-gray-600">Years Exp.</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">2K+</div>
                        <div className="text-xs text-gray-600">Clients Helped</div>
                      </div>
                    </div>

                    {/* Personal Quote */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <blockquote className="text-sm text-gray-700 italic leading-relaxed">
                        "Every relocation is unique. I ensure each family gets the personalized guidance they deserve to make Switzerland feel like home."
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Let's get started</h3>
                  <p className="text-gray-600">What should we call you?</p>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    First name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                    placeholder="Enter your first name"
                    autoFocus
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.firstName.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Destination */}
          {currentStep === 2 && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Great, {formData.firstName}! 👋
                  </h3>
                  <p className="text-gray-600">Where are you planning to relocate?</p>
                </div>
                
                <div className="relative mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Destination city *
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => {
                      setFormData({ ...formData, destination: e.target.value });
                      setCityFilter(e.target.value);
                    }}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                    placeholder="Type a Swiss city..."
                    autoFocus
                  />
                  
                  {filteredCities.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-xl z-10 max-h-64 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setFormData({ ...formData, destination: city });
                            setFilteredCities([]);
                            setCityFilter('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium">{city}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.destination.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    When are you planning to move to {formData.destination}?
                  </h3>
                  <p className="text-gray-600">This helps us prioritize your needs</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, timeline: option.value })}
                      className={`p-4 border-2 rounded-xl transition-all text-left hover:shadow-md ${
                        formData.timeline === option.value
                          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-700 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-sm font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.timeline}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Priorities */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    What are your main priorities?
                  </h3>
                  <p className="text-gray-600">Select all that apply (optional)</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePriorityToggle(option.id)}
                      className={`p-4 border-2 rounded-xl transition-all text-center hover:shadow-md ${
                        formData.priorities.includes(option.id)
                          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-700 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-sm font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Contact Info */}
          {currentStep === 5 && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Almost done! 🎉
                  </h3>
                  <p className="text-gray-600">How can we reach you with your matches?</p>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      placeholder="your@email.com"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Phone number (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      placeholder="+41 XX XXX XX XX"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.email.trim() || isSubmitting}
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      `${SERVICE_FLOWS[formData.selectedFlow].cta} 🚀`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 6 && isSuccess && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Thank you, {formData.firstName}! 🎉
                </h3>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Your request has been submitted successfully. Our team will connect you with the perfect Swiss relocation specialists for your move to <span className="font-semibold text-primary-600">{formData.destination}</span>.
                </p>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">What happens next?</h4>
                  <ul className="text-left text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">1.</span>
                      We'll review your requirements within 2 hours
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">2.</span>
                      You'll receive your personalized matches via email
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">3.</span>
                      Connect directly with specialists that fit your needs
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-500">
                  This window will close automatically in 3 seconds...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Trust Icons */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-b-3xl">
          <div className="flex flex-wrap items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span className="font-semibold">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="font-semibold">Swiss Licensed</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="font-semibold">Verified Experts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalContactModal;
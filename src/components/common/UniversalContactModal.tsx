import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isModalOpen, modalContext, closeModal, type ModalContext } from '../../stores/modal';

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

// Service flow options - clean, neutral design
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
    timeframe: '24-48 hours'
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
    timeframe: 'Same day'
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
    timeframe: '60 seconds'
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

const UniversalContactModal: React.FC = () => {
  const modalOpen = useStore(isModalOpen);
  const context = useStore(modalContext);
  
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
      headline: "Find Your Perfect Swiss Relocation Specialist",
      subtext: "Get expert guidance tailored to your unique situation",
      trustSignal: "127 people found their perfect specialist this week"
    };

    switch (context.page) {
      case 'blog':
        return {
          headline: `Ready to Apply This ${context.topic || 'Guide'}?`,
          subtext: "Connect with experts who can help you implement these insights",
          trustSignal: "89 readers got expert help this week"
        };
      case 'service':
        return {
          headline: `Find ${context.service || 'Relocation'} Specialists`,
          subtext: "Connect with verified experts in this service area",
          trustSignal: "156 successful matches this month"
        };
      case 'corporate':
        return {
          headline: "Enterprise Relocation Solutions",
          subtext: "Streamlined services for employee relocations",
          trustSignal: "42 companies upgraded their relocation program"
        };
      case 'region':
        return {
          headline: `${context.region || 'Swiss'} Relocation Experts`,
          subtext: "Local specialists with deep regional knowledge",
          trustSignal: "73 families relocated successfully this month"
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
      // Submit to Formspree or your backend
      const response = await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          context,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setCurrentStep(5); // Success step
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / 6) * 100;
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-1 bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-500"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{contextContent.headline}</h2>
              <p className="text-gray-600">{contextContent.subtext}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Trust Signal */}
          <div className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-full text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            {contextContent.trustSignal}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {currentStep === 0 && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Service Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Path</h3>
                
                {/* Service Flow Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                  {Object.entries(SERVICE_FLOWS).map(([key, flow]) => (
                    <button
                      key={key}
                      onClick={() => handleFlowSelect(key as 'quotes' | 'session' | 'match')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        formData.selectedFlow === key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {flow.title}
                    </button>
                  ))}
                </div>

                {/* Selected Service Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {SERVICE_FLOWS[formData.selectedFlow].title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {SERVICE_FLOWS[formData.selectedFlow].description}
                    </p>
                    <div className="text-xs text-gray-500 mb-4">
                      ⏱️ Response time: {SERVICE_FLOWS[formData.selectedFlow].timeframe}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {SERVICE_FLOWS[formData.selectedFlow].benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all"
                  >
                    {SERVICE_FLOWS[formData.selectedFlow].cta}
                  </button>
                </div>
              </div>

              {/* Right: Consultant Card */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-center">
                  <img
                    src="https://res.cloudinary.com/dphbnwjtx/image/upload/v1747501071/6758848048b5cdaf6ebe884f_WhatsApp_Image_2024-12-11_at_01.55.01_oruhjs.webp"
                    alt="Robert Kolar - Swiss Relocation Expert"
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                  />
                  <h4 className="font-semibold text-gray-900 mb-1">Robert Kolar</h4>
                  <p className="text-sm text-gray-600 mb-4">Senior Relocation Expert</p>
                  
                  {/* Language Badges */}
                  <div className="flex justify-center space-x-2 mb-4">
                    <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded border">🇩🇪 German</span>
                    <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded border">🇬🇧 English</span>
                    <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded border">🇫🇷 French</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">500+</div>
                      <div className="text-xs text-gray-600">Relocations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">10+</div>
                      <div className="text-xs text-gray-600">Years Exp.</div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 text-left">
                    "Every relocation is unique. I ensure each family gets the personalized guidance they deserve."
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Let's get started</h3>
                <p className="text-gray-600">What should we call you?</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your first name"
                  autoFocus
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.firstName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Destination */}
          {currentStep === 2 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Great, {formData.firstName}! 👋
                </h3>
                <p className="text-gray-600">Where are you planning to relocate?</p>
              </div>
              
              <div className="relative mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination city *
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => {
                    setFormData({ ...formData, destination: e.target.value });
                    setCityFilter(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Type a Swiss city..."
                  autoFocus
                />
                
                {filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setFormData({ ...formData, destination: city });
                          setFilteredCities([]);
                          setCityFilter('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.destination.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  When are you planning to move to {formData.destination}?
                </h3>
                <p className="text-gray-600">This helps us prioritize your needs</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {TIMELINE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, timeline: option.value })}
                    className={`p-4 border rounded-lg transition-all text-left ${
                      formData.timeline === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.timeline}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Priorities */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What are your main priorities?
                </h3>
                <p className="text-gray-600">Select all that apply</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {PRIORITY_OPTIONS.map((priority) => (
                  <button
                    key={priority.id}
                    onClick={() => handlePriorityToggle(priority.id)}
                    className={`p-4 border rounded-lg transition-all text-center ${
                      formData.priorities.includes(priority.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">{priority.icon}</div>
                    <div className="text-xs font-medium">{priority.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={formData.priorities.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all"
                >
                  Continue ({formData.priorities.length} selected)
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Contact Info & Submit */}
          {currentStep === 5 && !isSuccess && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Almost done, {formData.firstName}!
                </h3>
                <p className="text-gray-600">How can we reach you with your recommendations?</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone number (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Your privacy is protected</p>
                      <p>GDPR compliant. We'll never share your information.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.email.trim() || isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-secondary-700 transition-all flex items-center space-x-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isSubmitting ? 'Submitting...' : SERVICE_FLOWS[formData.selectedFlow].cta}</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 5 && isSuccess && (
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thank you, {formData.firstName}! 🎉
              </h3>
              <p className="text-gray-600 mb-6">
                Your {formData.destination} relocation journey begins now
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">What happens next:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Robert reviews your requirements personally</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Personalized recommendations within {SERVICE_FLOWS[formData.selectedFlow].timeframe}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Direct connection with your matched specialists</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Trust Row Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Swiss Licensed</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Experts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalContactModal;
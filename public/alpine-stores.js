// Alpine.js Global Stores
// Replaces 476 lines of React polling/queue code with clean state management

document.addEventListener('alpine:init', () => {

    // Assessment Modal Store
    Alpine.store('assessmentModal', {
        isOpen: false,
        step: 'household',
        history: [],
        mode: 'private', // 'private' or 'corporate'
        initialCanton: '',
        initialService: '',
        submitting: false,
        success: false,

        data: {
            householdType: '',
            area: '',
            budget: '',
            engagement: '',
            citizenship: '',
            purpose: '',
            employment: '',
            ages: '',
            system: '',
            priority: '',
            tempHousing: '',
            vipBudget: '',
            funding: '',
            when: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            companyName: '',
            corpVolume: '',
            corpScope: [],
            corpRegions: [],
            corpPainPoints: [],
            corpOutcome: '',
            jobTitle: ''
        },

        get progress() {
            const steps = this.getStepFlow();
            const currentIndex = steps.indexOf(this.step);
            return Math.round(((currentIndex + 1) / steps.length) * 100);
        },

        get currentStepNumber() {
            const steps = this.getStepFlow();
            return Math.max(1, steps.indexOf(this.step) + 1);
        },

        get totalSteps() {
            return this.getStepFlow().length;
        },

        get assessmentLabel() {
            return this.mode === 'corporate' ? 'Corporate provider assessment' : 'Swiss move assessment';
        },

        get matchCount() {
            if (this.mode === 'corporate') return '5-8';
            const service = this.initialService.toLowerCase();
            if (service.includes('housing')) return '3-5';
            if (service.includes('immigration') || service.includes('visa')) return '2-4';
            if (service.includes('education') || service.includes('school')) return '2-3';
            return '4-6';
        },

        getStepFlow() {
            const service = this.initialService.toLowerCase();

            // Corporate flow (Always takes precedence)
            if (service === 'corporate' || this.mode === 'corporate') {
                return ['corpVolume', 'corpScope', 'corpRegions', 'corpPainPoints', 'corpOutcome', 'summary', 'lead'];
            }

            // VIP / Full Package flow
            if (service.includes('full') || service.includes('vip') || service.includes('settled') || service.includes('settling')) {
                return ['household', 'priority', 'tempHousing', 'vipBudget', 'funding', 'summary', 'lead'];
            }

            // Housing flow
            if (service.includes('housing')) {
                return ['household', 'area', 'budget', 'engagement', 'funding', 'summary', 'lead'];
            }

            // Immigration flow
            if (service.includes('immigration') || service.includes('visa')) {
                return ['household', 'citizenship', 'purpose', 'employment', 'funding', 'summary', 'lead'];
            }

            // Education/School flow
            if (service.includes('education') || service.includes('school')) {
                return ['household', 'ages', 'system', 'funding', 'summary', 'lead'];
            }

            // Default flow
            return ['household', 'funding', 'summary', 'lead'];
        },

        open(config = {}) {
            this.isOpen = true;
            document.body.classList.add('rf-assessment-open');
            this.mode = config.mode || 'private';
            this.initialCanton = config.initialCanton || '';
            this.initialService = config.initialService || '';
            this.success = false;

            // Set initial step based on mode
            const steps = this.getStepFlow();
            this.step = steps[0];
            this.history = [];

            // Pre-fill data from config
            if (config.company) this.data.companyName = config.company;
            if (config.volume) this.data.corpVolume = config.volume;
            if (config.when) this.data.when = config.when;

            // Lock body scroll
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.isOpen = false;
            document.body.classList.remove('rf-assessment-open');
            document.body.style.overflow = '';

            // Reset after animation
            setTimeout(() => {
                this.reset();
                document.body.classList.remove('rf-assessment-open');
            }, 300);
        },

        reset() {
            this.step = 'household';
            this.history = [];
            this.submitting = false;
            this.success = false;
            this.data = {
                householdType: '',
                area: '',
                budget: '',
                engagement: '',
                citizenship: '',
                purpose: '',
                employment: '',
                ages: '',
                system: '',
                priority: '',
                tempHousing: '',
                vipBudget: '',
                funding: '',
                when: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                companyName: '',
                corpVolume: '',
                corpScope: [],
                corpRegions: [],
                corpPainPoints: [],
                corpOutcome: '',
                jobTitle: ''
            };
        },

        answer(newData) {
            // Save answer
            Object.assign(this.data, newData);

            // Move to next step
            const steps = this.getStepFlow();
            const currentIndex = steps.indexOf(this.step);

            if (currentIndex < steps.length - 1) {
                this.history.push(this.step);
                this.step = steps[currentIndex + 1];
            }
        },

        back() {
            if (this.history.length > 0) {
                this.step = this.history.pop();
            }
        },

        async submit() {
            this.submitting = true;

            try {
                const response = await fetch('/api/leads/assessment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: this.data,
                        selectedDestination: this.initialCanton,
                        selectedService: this.initialService,
                        mode: this.mode
                    })
                });

                if (response.ok) {
                    this.success = true;
                    this.step = 'success';
                } else {
                    alert('Something went wrong. Please try again.');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Failed to submit. Please check your connection.');
            } finally {
                this.submitting = false;
            }
        }
    });

    // Contact Modal Store
    Alpine.store('contactModal', {
        isOpen: false,
        context: {},

        open(context = {}) {
            this.isOpen = true;
            this.context = context;
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.isOpen = false;
            document.body.style.overflow = '';
            setTimeout(() => {
                this.context = {};
            }, 300);
        }
    });
});

// Expose to window for backwards compatibility with existing code
window.openAssessmentModal = (mode, initialCanton, initialService) => {
    if (window.Alpine && Alpine.store('assessmentModal')) {
        Alpine.store('assessmentModal').open({
            mode: mode || 'private',
            initialCanton: initialCanton || '',
            initialService: initialService || ''
        });
    }
};

window.universalOpenModal = (context = {}) => {
    if (!window.Alpine || !Alpine.store('assessmentModal')) return;

    const rawContext = typeof context === 'string' ? { service: context } : context;
    const service = rawContext.service || rawContext.topic || rawContext.initialService || rawContext.tab || 'full-package';
    const isCorporate = rawContext.mode === 'corporate' || rawContext.tab === 'corporate' || service === 'corporate';
    const mode = isCorporate ? 'corporate' : 'private';
    const initialCanton = rawContext.canton || rawContext.region || rawContext.initialCanton || 'switzerland';

    Alpine.store('assessmentModal').open({
        mode,
        initialCanton,
        initialService: service,
        company: rawContext.agency || rawContext.company || '',
        volume: rawContext.volume || '',
        when: rawContext.when || ''
    });
};

window.openModal = (context) => {
    if (window.Alpine && Alpine.store('contactModal')) {
        Alpine.store('contactModal').open(context);
    }
};

window.closeModal = () => {
    if (window.Alpine) {
        if (Alpine.store('assessmentModal')?.isOpen) {
            Alpine.store('assessmentModal').close();
        }
        if (Alpine.store('contactModal')?.isOpen) {
            Alpine.store('contactModal').close();
        }
    }
};

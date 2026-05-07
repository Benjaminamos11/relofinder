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
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            companyName: '',
            volume: ''
        },

        get progress() {
            const steps = this.getStepFlow();
            const currentIndex = steps.indexOf(this.step);
            return Math.round(((currentIndex + 1) / steps.length) * 100);
        },

        getStepFlow() {
            const service = this.initialService.toLowerCase();

            // Housing flow
            if (service.includes('housing') || service.includes('full-package')) {
                return ['household', 'area', 'budget', 'engagement', 'funding', 'lead'];
            }

            // Immigration flow
            if (service.includes('immigration') || service.includes('visa')) {
                return ['household', 'citizenship', 'purpose', 'employment', 'funding', 'lead'];
            }

            // Education/School flow
            if (service.includes('education') || service.includes('school')) {
                return ['household', 'ages', 'system', 'funding', 'lead'];
            }

            // Corporate flow
            if (service === 'corporate' || this.mode === 'corporate') {
                return ['corpVolume', 'corpScope', 'corpRegions', 'lead'];
            }

            // Default flow
            return ['household', 'funding', 'lead'];
        },

        open(config = {}) {
            this.isOpen = true;
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
            if (config.volume) this.data.volume = config.volume;
            if (config.when) this.data.when = config.when;

            // Lock body scroll
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.isOpen = false;
            document.body.style.overflow = '';

            // Reset after animation
            setTimeout(() => {
                this.reset();
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
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                companyName: '',
                volume: ''
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
                const response = await fetch('/api/leads/assessment/', {
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

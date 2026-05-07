export default (Alpine) => {
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

        answer(payload) {
            // Save current state to history before changing
            this.history.push({
                step: this.step,
                data: JSON.parse(JSON.stringify(this.data))
            });

            // Update data
            this.data = { ...this.data, ...payload };

            // Move to next step
            this.next();
        },

        back() {
            if (this.history.length > 0) {
                const previousState = this.history.pop();
                this.step = previousState.step;
                this.data = previousState.data;
            }
        },

        next() {
            const steps = this.getStepFlow();
            const currentIndex = steps.indexOf(this.step);

            if (currentIndex < steps.length - 1) {
                this.step = steps[currentIndex + 1];
            } else {
                this.submit();
            }
        },

        async submit() {
            this.submitting = true;

            const payload = {
                service_type: this.initialService || 'general_inquiry',
                region_interest: this.initialCanton || 'unknown',
                budget_range: this.data.budget || this.data.vipBudget,
                timeline: this.data.engagement,
                first_name: this.data.firstName,
                last_name: this.data.lastName,
                email: this.data.email,
                phone: this.data.phone,
                metadata: {
                    household_type: this.data.householdType,
                    area_preference: this.data.area,
                    citizenship: this.data.citizenship,
                    purpose: this.data.purpose,
                    employment: this.data.employment,
                    ages: this.data.ages,
                    system: this.data.system,
                    priority: this.data.priority,
                    temp_housing: this.data.tempHousing,
                    funding: this.data.funding,
                    client_mode: this.mode,
                    company: this.data.companyName,
                    volume: this.data.volume
                },
                status: 'new'
            };

            try {
                // Remove trailing slash if present on current URL for base API route
                const baseUrl = window.location.origin;
                const response = await fetch(`${baseUrl}/api/assessments/submit/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    this.success = true;
                    this.step = 'success';
                } else {
                    console.error("Submission failed", await response.text());
                    alert('Something went wrong. Please try again.');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('A network error occurred. Please try again.');
            } finally {
                this.submitting = false;
            }
        },

        reset() {
            this.step = this.getStepFlow()[0];
            this.history = [];
            this.data = {
                householdType: '', area: '', budget: '', engagement: '',
                citizenship: '', purpose: '', employment: '', ages: '',
                system: '', priority: '', tempHousing: '', vipBudget: '',
                funding: '', firstName: '', lastName: '', email: '', phone: '',
                companyName: '', volume: ''
            };
            this.submitting = false;
            this.success = false;
            this.mode = 'private';
            this.initialCanton = '';
            this.initialService = '';
        }
    });

    // Make utility functions global if needed (for backwards compatibility)
    window.openAssessmentModal = (serviceType = 'housing-search', location = '') => {
        Alpine.store('assessmentModal').open({
            mode: 'private',
            initialService: serviceType,
            initialCanton: location
        });
    };

    window.openCorporateModal = () => {
        Alpine.store('assessmentModal').open({
            mode: 'corporate'
        });
    };
};

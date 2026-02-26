# 🚀 React to Alpine.js Migration Plan
## Goal: Remove React, Keep Exact Same Look & Functionality, Gain Speed

**Current Problem:**
- 9,515 lines of React code
- 156KB+ bundle sizes
- Hydration errors blocking page
- Slow load times

**Target Result:**
- ~95% less JavaScript
- Instant page loads
- No hydration errors
- Same exact UI/UX

---

## 📊 Component Inventory

### Critical Path Components (User-Facing, High Priority)
| Component | Lines | Bundle | Current Issue | Migration Method |
|-----------|-------|--------|--------------|------------------|
| **HeroSearch** | 258 | 11KB | Not rendering on homepage | Alpine.js |
| **AssessmentModal** | 921 | 156KB | Too slow, blocks page | Alpine.js + HTML Form |
| **ContactModal** | 481 | 14KB | Hydration errors | Alpine.js |
| **AgenciesCarousel** | 549 | 14KB | Could be simpler | Alpine.js + CSS |
| **FeaturedAgencies** | 311 | - | Loading all on page | Server-rendered |

### Admin/Dashboard Components (Low Priority, Keep React OK)
| Component | Lines | Notes |
|-----------|-------|-------|
| AdminDashboard | 1,042 | Keep React - admin only, low traffic |
| DashboardLayout | 572 | Keep React - agency portal |
| QuoteInterface | 305 | Keep React - internal tool |
| UserDashboard | 320 | Keep React - authenticated only |

### Supporting Components (Medium Priority)
| Component | Lines | Migration Method |
|-----------|-------|------------------|
| RFPForm | 408 | Convert to HTML form |
| TrustedProfessionalsSlider | 447 | Alpine.js + CSS |
| ProfileEditor | 368 | Keep React (admin) |
| AgencyReviewSummary | 374 | Server-rendered |

---

## 🎯 Phase 1: Critical User-Facing Components (Week 1-2)

### 1.1 HeroSearch Component
**Current:** React component with tabs, dropdowns, state management
**Target:** Alpine.js component
**Estimated Size:** 258 lines → ~80 lines Alpine + HTML

#### Functionality to Replicate:
- ✅ Tab switching (Private vs Corporate)
- ✅ Dropdown selections (Canton, Service, When)
- ✅ Form state management
- ✅ Form validation
- ✅ Submit to assessment modal
- ✅ Pre-fill from URL params (initialDestination, initialService)

#### Implementation Strategy:
```html
<div x-data="heroSearch()">
  <!-- Tabs -->
  <div class="flex border-b">
    <button @click="activeTab = 'private'"
            :class="activeTab === 'private' ? 'active' : ''">
      Private Move
    </button>
    <button @click="activeTab = 'corporate'"
            :class="activeTab === 'corporate' ? 'active' : ''">
      Corporate / HR
    </button>
  </div>

  <!-- Private Form -->
  <form x-show="activeTab === 'private'"
        @submit.prevent="openAssessment()">
    <select x-model="where">
      <option value="zurich">Zurich</option>
      <!-- ... -->
    </select>
    <button type="submit">Find Agencies</button>
  </form>

  <!-- Corporate Form -->
  <form x-show="activeTab === 'corporate'"
        @submit.prevent="openCorporateAssessment()">
    <!-- Corporate fields -->
  </form>
</div>

<script>
function heroSearch() {
  return {
    activeTab: 'private',
    where: new URLSearchParams(window.location.search).get('where') || '',
    service: new URLSearchParams(window.location.search).get('service') || '',
    when: '',
    openAssessment() {
      // Trigger assessment modal via Alpine.js store
      Alpine.store('assessmentModal').open({
        where: this.where,
        service: this.service,
        when: this.when
      });
    }
  }
}
</script>
```

#### CSS (Keep Exact Same Styling):
- Copy all Tailwind classes exactly
- Ensure transitions match
- Test hover states

#### Testing Checklist:
- [ ] Tabs switch smoothly
- [ ] Dropdowns work on mobile
- [ ] Form submits correctly
- [ ] Pre-fill works from URL
- [ ] Styling matches pixel-perfect
- [ ] Works without JavaScript (progressive enhancement)

---

### 1.2 AssessmentModal Component
**Current:** 921-line React component with Framer Motion
**Target:** Alpine.js modal with CSS transitions
**Estimated Size:** 921 lines → ~250 lines Alpine + HTML

#### Functionality to Replicate:
- ✅ Multi-step wizard (17 steps)
- ✅ Conditional step flow based on answers
- ✅ Progress indicator
- ✅ Form validation per step
- ✅ Back/forward navigation
- ✅ Submit to Supabase
- ✅ Success/error states
- ✅ Portal rendering
- ✅ Animations (replace Framer Motion with CSS)

#### Implementation Strategy:

**Step 1: Create Alpine.js Store for Global State**
```javascript
// In global Alpine initialization
Alpine.store('assessmentModal', {
  isOpen: false,
  currentStep: 1,
  totalSteps: 17,
  data: {
    householdType: '',
    area: '',
    budget: '',
    // ... all fields
  },

  open(initialData = {}) {
    this.isOpen = true;
    this.data = { ...this.data, ...initialData };
  },

  close() {
    this.isOpen = false;
    this.reset();
  },

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  },

  reset() {
    this.currentStep = 1;
    this.data = {};
  },

  async submit() {
    // Submit to Supabase API endpoint
    const response = await fetch('/api/leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.data)
    });
    return response.json();
  }
});
```

**Step 2: HTML Structure**
```html
<div x-data
     x-show="$store.assessmentModal.isOpen"
     x-cloak
     @keydown.escape="$store.assessmentModal.close()"
     class="fixed inset-0 z-50 overflow-y-auto">

  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50 transition-opacity"
       x-show="$store.assessmentModal.isOpen"
       x-transition:enter="ease-out duration-300"
       x-transition:enter-start="opacity-0"
       x-transition:enter-end="opacity-100"
       @click="$store.assessmentModal.close()">
  </div>

  <!-- Modal -->
  <div class="relative min-h-full flex items-center justify-center p-4">
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
         x-show="$store.assessmentModal.isOpen"
         x-transition:enter="ease-out duration-300"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100"
         @click.stop>

      <!-- Close Button -->
      <button @click="$store.assessmentModal.close()"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <svg><!-- X icon --></svg>
      </button>

      <!-- Progress Bar -->
      <div class="h-2 bg-gray-100 rounded-t-2xl overflow-hidden">
        <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
             :style="`width: ${($store.assessmentModal.currentStep / $store.assessmentModal.totalSteps) * 100}%`">
        </div>
      </div>

      <!-- Step Content -->
      <div class="p-8">
        <!-- Step 1: Household Type -->
        <div x-show="$store.assessmentModal.currentStep === 1"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-x-4"
             x-transition:enter-end="opacity-100 translate-x-0">

          <h2 class="text-2xl font-bold mb-6">Who's moving?</h2>

          <div class="grid grid-cols-2 gap-4">
            <button @click="$store.assessmentModal.data.householdType = 'single'; $store.assessmentModal.nextStep()"
                    class="p-6 border-2 rounded-xl hover:border-blue-500 transition">
              <svg><!-- User icon --></svg>
              <span>Single</span>
            </button>
            <button @click="$store.assessmentModal.data.householdType = 'couple'; $store.assessmentModal.nextStep()"
                    class="p-6 border-2 rounded-xl hover:border-blue-500 transition">
              <svg><!-- Users icon --></svg>
              <span>Couple</span>
            </button>
            <!-- More options -->
          </div>
        </div>

        <!-- Step 2: Area Preference -->
        <div x-show="$store.assessmentModal.currentStep === 2"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-x-4"
             x-transition:enter-end="opacity-100 translate-x-0">

          <h2 class="text-2xl font-bold mb-6">Preferred area?</h2>

          <div class="space-y-3">
            <button @click="$store.assessmentModal.data.area = 'city-center'; $store.assessmentModal.nextStep()"
                    class="w-full p-4 border-2 rounded-xl text-left hover:border-blue-500 transition">
              City Center
            </button>
            <button @click="$store.assessmentModal.data.area = 'suburbs'; $store.assessmentModal.nextStep()"
                    class="w-full p-4 border-2 rounded-xl text-left hover:border-blue-500 transition">
              Suburbs
            </button>
            <!-- More options -->
          </div>

          <button @click="$store.assessmentModal.prevStep()"
                  class="mt-6 text-gray-500 hover:text-gray-700">
            ← Back
          </button>
        </div>

        <!-- Steps 3-16: Similar structure -->
        <!-- ... -->

        <!-- Step 17: Lead Form -->
        <div x-show="$store.assessmentModal.currentStep === 17"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-x-4"
             x-transition:enter-end="opacity-100 translate-x-0">

          <h2 class="text-2xl font-bold mb-6">Get your matches</h2>

          <form @submit.prevent="handleSubmit()">
            <input type="text"
                   x-model="$store.assessmentModal.data.firstName"
                   placeholder="First Name"
                   required
                   class="w-full px-4 py-3 border rounded-xl mb-4">

            <input type="email"
                   x-model="$store.assessmentModal.data.email"
                   placeholder="Email"
                   required
                   class="w-full px-4 py-3 border rounded-xl mb-4">

            <input type="tel"
                   x-model="$store.assessmentModal.data.phone"
                   placeholder="Phone"
                   class="w-full px-4 py-3 border rounded-xl mb-4">

            <button type="submit"
                    class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:opacity-90 transition">
              Get My Recommendations
            </button>
          </form>

          <button @click="$store.assessmentModal.prevStep()"
                  class="mt-6 text-gray-500 hover:text-gray-700">
            ← Back
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
async function handleSubmit() {
  try {
    const result = await Alpine.store('assessmentModal').submit();
    if (result.success) {
      // Show success message or redirect
      window.location.href = '/my-move';
    }
  } catch (error) {
    console.error('Submission failed:', error);
    alert('Something went wrong. Please try again.');
  }
}
</script>
```

#### Replace Framer Motion with CSS:
```css
/* Smooth transitions (replaces Framer Motion) */
[x-cloak] { display: none !important; }

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Slide animations */
.slide-enter {
  transform: translateX(1rem);
  opacity: 0;
}

.slide-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: all 0.3s ease-out;
}
```

#### Testing Checklist:
- [ ] All 17 steps render correctly
- [ ] Conditional logic works (different flows for different answers)
- [ ] Back button works
- [ ] Progress bar updates smoothly
- [ ] Form validation works
- [ ] Submits to Supabase correctly
- [ ] Success/error states show
- [ ] Animations feel smooth (CSS transitions)
- [ ] Works on mobile
- [ ] Keyboard navigation (Tab, Enter, Escape)

---

### 1.3 UniversalContactModal Component
**Current:** React wrapper around ContactModal
**Target:** Alpine.js modal
**Estimated Size:** 481 lines → ~150 lines

#### Functionality to Replicate:
- ✅ Open/close from anywhere
- ✅ Global state management
- ✅ Context-aware (knows which page called it)
- ✅ Form submission to API
- ✅ Integration with existing modal queue system

#### Implementation Strategy:
```javascript
// Global Alpine Store
Alpine.store('contactModal', {
  isOpen: false,
  context: {},

  open(context = {}) {
    this.context = context;
    this.isOpen = true;
  },

  close() {
    this.isOpen = false;
    this.context = {};
  }
});

// Expose to window for backwards compatibility
window.openModal = (context) => {
  Alpine.store('contactModal').open(context);
};

window.closeModal = () => {
  Alpine.store('contactModal').close();
};
```

#### HTML Structure:
```html
<div x-data
     x-show="$store.contactModal.isOpen"
     x-cloak
     @keydown.escape="$store.contactModal.close()"
     class="fixed inset-0 z-50">

  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50"
       @click="$store.contactModal.close()">
  </div>

  <!-- Modal Content -->
  <div class="relative min-h-full flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
         @click.stop>

      <h2 class="text-2xl font-bold mb-6">Contact Agencies</h2>

      <form @submit.prevent="submitContact()">
        <input type="text"
               x-model="name"
               placeholder="Name"
               required
               class="w-full px-4 py-3 border rounded-xl mb-4">

        <input type="email"
               x-model="email"
               placeholder="Email"
               required
               class="w-full px-4 py-3 border rounded-xl mb-4">

        <textarea x-model="message"
                  placeholder="Message"
                  rows="4"
                  class="w-full px-4 py-3 border rounded-xl mb-4">
        </textarea>

        <button type="submit"
                class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>
    </div>
  </div>
</div>
```

#### Testing Checklist:
- [ ] Opens from all trigger points
- [ ] Context data passes correctly
- [ ] Form submits to API
- [ ] Backwards compatible with existing `openModal()` calls
- [ ] No hydration errors

---

## 🎯 Phase 2: Supporting Components (Week 3)

### 2.1 AgenciesCarousel
**Current:** React carousel with state
**Target:** Alpine.js carousel
**Complexity:** Medium

#### Use Existing Libraries:
- Option A: Swiper.js (lightweight, no framework needed)
- Option B: Pure Alpine.js carousel

#### Implementation:
```html
<div x-data="{ currentSlide: 0, totalSlides: 5 }"
     class="relative">

  <!-- Slides -->
  <div class="overflow-hidden">
    <div class="flex transition-transform duration-500"
         :style="`transform: translateX(-${currentSlide * 100}%)`">

      <!-- Slide 1 -->
      <div class="min-w-full">
        <!-- Agency card -->
      </div>

      <!-- More slides -->
    </div>
  </div>

  <!-- Navigation -->
  <button @click="currentSlide = Math.max(0, currentSlide - 1)"
          :disabled="currentSlide === 0"
          class="absolute left-0 top-1/2 -translate-y-1/2">
    ←
  </button>

  <button @click="currentSlide = Math.min(totalSlides - 1, currentSlide + 1)"
          :disabled="currentSlide === totalSlides - 1"
          class="absolute right-0 top-1/2 -translate-y-1/2">
    →
  </button>

  <!-- Auto-play (optional) -->
  <template x-init="setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
  }, 5000)"></template>
</div>
```

### 2.2 RFPForm (Corporate Form)
**Current:** React form with validation
**Target:** HTML form with Alpine.js validation

#### Implementation:
```html
<form x-data="rfpForm()"
      @submit.prevent="submit()"
      class="space-y-6">

  <div>
    <label>Company Name</label>
    <input type="text"
           x-model="companyName"
           @blur="validate('companyName')"
           required>
    <span x-show="errors.companyName"
          class="text-red-500 text-sm">
      <span x-text="errors.companyName"></span>
    </span>
  </div>

  <!-- More fields -->

  <button type="submit"
          :disabled="submitting"
          class="w-full bg-blue-600 text-white py-3 rounded-xl">
    <span x-show="!submitting">Submit RFP</span>
    <span x-show="submitting">Submitting...</span>
  </button>
</form>

<script>
function rfpForm() {
  return {
    companyName: '',
    volume: '',
    errors: {},
    submitting: false,

    validate(field) {
      // Validation logic
      if (field === 'companyName' && !this.companyName) {
        this.errors.companyName = 'Company name is required';
      } else {
        delete this.errors.companyName;
      }
    },

    async submit() {
      this.submitting = true;

      try {
        const response = await fetch('/api/corporate/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: this.companyName,
            volume: this.volume
          })
        });

        if (response.ok) {
          window.location.href = '/thank-you';
        }
      } catch (error) {
        alert('Error submitting form');
      } finally {
        this.submitting = false;
      }
    }
  }
}
</script>
```

---

## 🎯 Phase 3: Global State & Integration (Week 4)

### 3.1 Remove Layout.astro Inline Scripts
**Current:** 476 lines of polling, queue processing
**Target:** Clean Alpine.js store initialization

#### Replace This:
```javascript
// Current: 476 lines of complex polling
window.modalEventQueue = [];
window.modalReady = false;
// ... lots of setInterval, MutationObserver, etc.
```

#### With This:
```javascript
// Clean Alpine initialization
document.addEventListener('alpine:init', () => {
  Alpine.store('assessmentModal', {
    isOpen: false,
    data: {},
    open(data) { this.isOpen = true; this.data = data; },
    close() { this.isOpen = false; }
  });

  Alpine.store('contactModal', {
    isOpen: false,
    context: {},
    open(ctx) { this.isOpen = true; this.context = ctx; },
    close() { this.isOpen = false; }
  });
});

// Backwards compatibility
window.openModal = (ctx) => Alpine.store('contactModal').open(ctx);
window.openAssessmentModal = (mode, canton, service) => {
  Alpine.store('assessmentModal').open({ mode, canton, service });
};
```

### 3.2 Update Layout.astro
```astro
---
// Remove React components
// Remove UniversalContactModal, GlobalAssessmentModal with client:load
---

<html>
  <head>
    <!-- Alpine.js (13KB gzipped) -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  </head>
  <body>
    <!-- Your content -->

    <!-- Alpine-based modals (no React!) -->
    <div id="assessment-modal">
      <!-- Assessment modal HTML here -->
    </div>

    <div id="contact-modal">
      <!-- Contact modal HTML here -->
    </div>

    <!-- Simple initialization (no polling!) -->
    <script>
      document.addEventListener('alpine:init', () => {
        // Initialize stores
      });
    </script>
  </body>
</html>
```

---

## 📦 Bundle Size Comparison

### Before (React):
```
react + react-dom:        130 KB
framer-motion:             60 KB
lucide-react (45 icons):   40 KB
AssessmentModal bundle:   156 KB
UniversalContactModal:     14 KB
HeroSearch:                11 KB
Other React components:   100 KB
─────────────────────────────────
TOTAL:                    511 KB
```

### After (Alpine.js):
```
Alpine.js:                 13 KB
Custom components:         20 KB
─────────────────────────────────
TOTAL:                     33 KB
```

**Reduction: 93.5% smaller! (478KB saved)**

---

## ⚡ Performance Improvements Expected

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Initial Bundle** | 511 KB | 33 KB | 93.5% smaller |
| **Time to Interactive** | 4-8 seconds | <1 second | 4-8x faster |
| **React Hydration** | 2-3 seconds | N/A (none) | ∞% faster |
| **First Input Delay** | 300-500ms | <50ms | 6-10x faster |
| **Lighthouse Score** | 60-70 | 95+ | +35 points |

---

## 🧪 Testing Strategy

### Unit Testing:
- [ ] Test each Alpine component in isolation
- [ ] Test form validation
- [ ] Test modal open/close
- [ ] Test state management

### Integration Testing:
- [ ] Test modal triggering from different pages
- [ ] Test form submission flows
- [ ] Test backwards compatibility with old `openModal()` calls

### E2E Testing:
- [ ] Complete user flow: Homepage → Assessment → Lead submission
- [ ] Mobile device testing
- [ ] Browser compatibility (Chrome, Safari, Firefox, Edge)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Performance Testing:
- [ ] Lighthouse scores before/after
- [ ] Bundle size verification
- [ ] Time to Interactive measurement
- [ ] First Contentful Paint
- [ ] Largest Contentful Paint

---

## 🚨 Risk Mitigation

### Risk 1: Feature Parity
**Mitigation:** Create checklist for each component, verify all functionality pixel-perfect

### Risk 2: Breaking Existing Integrations
**Mitigation:** Maintain backwards compatibility with window.openModal(), gradual rollout

### Risk 3: SEO Impact
**Mitigation:** Alpine components should be server-rendered HTML, progressive enhancement

### Risk 4: Browser Support
**Mitigation:** Alpine.js supports all modern browsers, test on IE11 if needed

---

## 📅 Implementation Timeline

### Week 1:
- [ ] Day 1-2: HeroSearch migration
- [ ] Day 3-5: AssessmentModal migration (core structure)

### Week 2:
- [ ] Day 1-3: AssessmentModal (all 17 steps)
- [ ] Day 4-5: UniversalContactModal migration

### Week 3:
- [ ] Day 1-2: AgenciesCarousel migration
- [ ] Day 3-4: RFPForm migration
- [ ] Day 5: Testing & bug fixes

### Week 4:
- [ ] Day 1-2: Clean up Layout.astro scripts
- [ ] Day 3: Final testing & performance verification
- [ ] Day 4: Deploy to staging
- [ ] Day 5: Monitor & deploy to production

---

## ✅ Success Criteria

- [ ] All user-facing features work exactly the same
- [ ] Bundle size reduced by >90%
- [ ] Lighthouse score >95
- [ ] No React hydration errors
- [ ] Time to Interactive <1 second
- [ ] All forms submit correctly
- [ ] Mobile experience improved
- [ ] No broken functionality

---

## 🎯 Priority Order

1. **CRITICAL (Do First):**
   - HeroSearch (homepage broken)
   - AssessmentModal (156KB bloat)
   - Layout.astro cleanup (polling blocking page)

2. **HIGH (Do Second):**
   - UniversalContactModal
   - AgenciesCarousel

3. **MEDIUM (Do Third):**
   - RFPForm
   - FeaturedAgencies

4. **LOW (Keep React OK):**
   - Admin dashboard
   - Agency dashboard
   - Internal tools

---

## 📝 Notes

- **Keep admin/dashboard React components:** Low traffic, complexity is OK
- **Progressive enhancement:** Everything should work without JavaScript (where possible)
- **Alpine.js is already loaded:** No extra dependency!
- **CSS transitions:** Replace Framer Motion with CSS for animations
- **Server-side rendering:** Most content should be HTML from Astro
- **API endpoints stay the same:** Only frontend changes

---

## 🚀 Quick Wins (Can do immediately)

1. **Change HeroSearch to Alpine.js** → Fixes homepage
2. **Remove Framer Motion** → Saves 60KB immediately
3. **Load modals with client:idle** → Defers React load
4. **Remove Layout.astro polling** → Stops blocking main thread

---

**Ready to start? Begin with Phase 1.1 (HeroSearch) first!**

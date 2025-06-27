# Universal Contact Modal System

A comprehensive, context-aware, multi-step contact modal for ReloFinder.ch that matches the blog page design aesthetic with Robert Kolar's photo, soft card design, and a complete user journey flow.

## Features

- **Context-Aware Content**: Dynamically adjusts headlines and subtext based on page context
- **Multi-Step Flow**: 7-step guided process with progress tracking
- **Swiss City Autocomplete**: Smart city suggestions for destination selection
- **Priority Selection**: Multi-select priorities with visual icons
- **Form Validation**: Real-time validation with helpful error states
- **Mobile Responsive**: Optimized for all screen sizes
- **Accessibility**: Full ARIA support and keyboard navigation
- **Trust Indicators**: Rating, GDPR compliance, and verification badges
- **Micro-Animations**: Smooth transitions between steps
- **Personalization**: Uses user's name throughout the journey

## Usage

### Method 1: Using the CTATrigger Component (Recommended)

```astro
---
import CTATrigger from '../components/common/CTATrigger.astro';
---

<!-- Basic usage -->
<CTATrigger text="Get Started" />

<!-- Blog page context -->
<CTATrigger 
  text="Apply This Guide" 
  context={{
    page: 'blog',
    topic: 'Swiss Visa Requirements'
  }}
/>

<!-- Service page context -->
<CTATrigger 
  text="Find Housing Experts" 
  variant="primary"
  size="lg"
  context={{
    page: 'service',
    service: 'Housing & Accommodation'
  }}
/>

<!-- Corporate page context -->
<CTATrigger 
  text="Get Corporate Quote" 
  variant="secondary"
  context={{
    page: 'corporate'
  }}
/>

<!-- Region page context -->
<CTATrigger 
  text="Connect with Local Experts" 
  context={{
    page: 'region',
    region: 'Zurich'
  }}
/>
```

### Method 2: Direct JavaScript Integration

```javascript
import { openModal } from '../stores/modal';

// Open modal with context
function handleCustomCTA() {
  openModal({
    page: 'blog',
    topic: 'Swiss Banking Guide',
    service: 'Banking & Finance'
  });
}

// Add to any button
document.getElementById('my-cta').addEventListener('click', handleCustomCTA);
```

### Method 3: HTML with Data Attributes

```html
<button 
  class="cta-trigger btn-primary"
  data-context='{"page": "service", "service": "Visa Services"}'
>
  Get Visa Help
</button>
```

## Context Options

The modal adapts its content based on the provided context:

### Page Types
- `'blog'` - Blog article context
- `'service'` - Service page context  
- `'corporate'` - Corporate solutions context
- `'region'` - Location-specific context
- `'home'` - Homepage context

### Context Properties
```typescript
interface ModalContext {
  page?: 'blog' | 'service' | 'corporate' | 'region' | 'home';
  topic?: string;      // Blog topic or general subject
  service?: string;    // Specific service name
  region?: string;     // Swiss region/city name
}
```

## Modal Flow Steps

1. **CTA Selection**: Choose between Quote, Expert Session, or Instant Match
2. **Name Collection**: Personalized greeting collection
3. **Destination**: Swiss city selection with autocomplete
4. **Timeline**: When they plan to relocate
5. **Priorities**: Multi-select service priorities
6. **Contact Info**: Email and optional phone with GDPR notice
7. **Success**: Personalized confirmation with next steps

## Styling & Design

The modal matches the blog page aesthetic:
- **Centered consultant photo** (Robert Kolar)
- **Soft card design** with rounded corners and subtle shadows
- **White background** with clean typography
- **Large headings** and readable text hierarchy
- **Minimalist line icons** (no green accent colors)
- **Trust row** at bottom with rating, GDPR, and verification badges
- **Gradient progress bar** and smooth transitions

## Customization Examples

### Different Button Variants

```astro
<!-- Primary gradient button -->
<CTATrigger 
  text="Start Your Journey"
  variant="primary"
  size="lg"
/>

<!-- Secondary button -->
<CTATrigger 
  text="Learn More"
  variant="secondary"
  size="md"
/>

<!-- Outline button -->
<CTATrigger 
  text="Get Quote"
  variant="outline"
  size="sm"
/>
```

### Page-Specific Implementations

#### Blog Article Integration
```astro
---
// In blog post template
const blogContext = {
  page: 'blog',
  topic: frontmatter.title,
  service: frontmatter.primaryService
};
---

<CTATrigger 
  text="Get Help with This"
  context={blogContext}
  className="mt-8"
/>
```

#### Service Page Integration
```astro
---
// In service page
const serviceContext = {
  page: 'service',
  service: 'Banking & Finance Services'
};
---

<CTATrigger 
  text="Find Banking Experts"
  variant="primary"
  size="lg"
  context={serviceContext}
/>
```

#### Corporate Page Integration
```astro
<CTATrigger 
  text="Get Corporate Solutions"
  variant="secondary"
  context={{ page: 'corporate' }}
  className="corporate-cta"
/>
```

## Form Submission

The modal submits to Formspree by default. Update the endpoint in `UniversalContactModal.tsx`:

```typescript
// In handleSubmit function
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
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
```

## Data Collected

The modal collects:
- **firstName**: User's first name
- **destination**: Swiss city destination
- **timeline**: Relocation timeline
- **priorities**: Array of selected priorities
- **email**: Contact email (required)
- **phone**: Contact phone (optional)
- **selectedCTA**: Which CTA option they chose
- **context**: Page context for personalization

## Analytics Integration

Track modal interactions:

```javascript
// Add to modal component
gtag('event', 'modal_open', {
  event_category: 'engagement',
  event_label: context.page,
  value: 1
});

gtag('event', 'form_submit', {
  event_category: 'conversion',
  event_label: formData.selectedCTA,
  value: 1
});
```

## Accessibility Features

- **ARIA labels** on all interactive elements
- **Keyboard navigation** support
- **Focus management** between steps
- **Screen reader** friendly progress indicators
- **High contrast** colors for readability
- **Mobile touch targets** appropriately sized

## Performance Optimizations

- **Client-side rendering** with `client:only="react"`
- **Lazy loading** of modal content
- **Minimal bundle size** with tree-shaking
- **Optimized images** for Robert's photo
- **Smooth animations** with CSS transforms

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Modal Not Opening
1. Check if nanostores are properly installed
2. Verify the modal is mounted in Layout.astro
3. Check browser console for JavaScript errors

### Context Not Working
1. Ensure context is properly JSON-stringified in data attributes
2. Verify the context object structure matches the interface
3. Check that the modal is receiving the context in the store

### Styling Issues
1. Verify Tailwind classes are properly compiled
2. Check that the modal has proper z-index values
3. Ensure the backdrop is covering the full viewport

## Migration from Old Modal

If migrating from the previous modal system:

1. Replace `<Modal />` with `<UniversalContactModal client:only="react" />` in Layout.astro
2. Update CTA buttons to use the new `CTATrigger` component
3. Replace direct modal calls with the new `openModal()` function
4. Update any custom styling to match the new class names

## Future Enhancements

- **Calendar integration** for appointment scheduling
- **Multi-language support** for different locales
- **Advanced form validation** with real-time feedback
- **Integration with CRM systems** for lead management
- **A/B testing** capabilities for different modal variants
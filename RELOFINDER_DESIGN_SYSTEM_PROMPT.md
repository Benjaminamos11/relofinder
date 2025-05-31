# 🎨 RELOFINDER DESIGN SYSTEM & DEVELOPMENT PROMPT

## 🌈 **MANDATORY COLOR SYSTEM**
**ONLY use these exact colors - NO OTHER COLORS ALLOWED:**

### **Primary Colors (Red-Pink Gradient)**
- `primary-50` to `primary-950` - Main brand gradient from light pink to deep red
- Primary gradient: `bg-gradient-to-r from-primary-600 to-primary-700`

### **SIGNATURE BRAND GRADIENT (MOST IMPORTANT)**
**This is the EXACT gradient from your brand images:**
```css
/* Main brand text gradient (red to blue) */
bg-gradient-to-r from-primary-600 via-purple-500 to-secondary-600 bg-clip-text text-transparent

/* Hero background gradient */
bg-gradient-to-br from-gray-50 via-white to-blue-50

/* Button/CTA gradients */
bg-gradient-to-r from-primary-600 to-primary-700

/* Card accent gradients */
bg-gradient-to-r from-primary-400 to-secondary-400
```

### **Secondary Colors (Blue Gradient)**  
- `secondary-50` to `secondary-950` - Complementary blue gradient
- Blue accent: `bg-gradient-to-r from-secondary-600 to-secondary-700`

### **Neutral Colors**
- `gray-50` to `gray-950` - For text, backgrounds, borders
- `white` and `black` - For contrast and typography

### **Utility Colors**
- `emerald-50` to `emerald-950` - ONLY for success states, trust badges
- NO other accent colors allowed (no yellow, purple, orange, etc.)

### **Background Gradients (MANDATORY for all pages)**
```css
/* Hero sections */
bg-gradient-to-br from-gray-50 via-white to-blue-50

/* Card backgrounds */  
bg-gradient-to-r from-primary-400 to-secondary-400

/* Button gradients */
bg-gradient-to-r from-primary-600 to-primary-700
```

---

## 🎯 **UX/UI DESIGN PRINCIPLES**

### **1. Layout Standards**
- **Container**: Always use `container mx-auto px-4` for consistent spacing
- **Sections**: Minimum `py-12 lg:py-20` padding for all major sections
- **Cards**: Always `rounded-xl lg:rounded-2xl` with `shadow-lg hover:shadow-xl`
- **Grid**: Use responsive grids: `grid lg:grid-cols-2/3/4 gap-6 lg:gap-8`

### **2. Typography Hierarchy**
```css
/* H1 - Page titles with brand gradient */
text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold
bg-gradient-to-r from-primary-600 via-purple-500 to-secondary-600 bg-clip-text text-transparent

/* H2 - Section titles */  
text-2xl lg:text-4xl font-bold text-gray-900

/* H3 - Subsection titles */
text-xl lg:text-2xl font-semibold text-gray-800

/* Body text - Natural, conversational */
text-base lg:text-lg text-gray-600 leading-relaxed

/* CTAs - Action-oriented */
text-base lg:text-lg font-semibold
```

### **3. Interactive Elements**
- **Buttons**: Always include hover effects with `hover:scale-105 transition-all duration-300`
- **Cards**: Include `hover:shadow-xl group` interactions
- **Icons**: Always `w-5 h-5` (mobile) to `w-6 h-6` (desktop) with proper color theming

### **4. Responsive Design**
- **Mobile-first**: Every element must work perfectly on mobile
- **Breakpoints**: Use `sm:`, `lg:`, `xl:` consistently
- **Touch-friendly**: Minimum 44px touch targets on mobile

---

## 🔧 **MANDATORY ICON SYSTEM**

### **Only use these Heroicon SVGs:**
```html
<!-- Success/Check -->
<svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
</svg>

<!-- Arrow Right -->
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
</svg>

<!-- Location -->
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
</svg>

<!-- Chat/Message -->
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
</svg>

<!-- Star Rating -->
<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
</svg>
```

**Icon Color Rules:**
- Primary brand actions: `text-primary-600`
- Success states: `text-emerald-600` 
- Neutral info: `text-gray-400` or `text-gray-600`
- Secondary actions: `text-secondary-600`

---

## 🚀 **SEO & LLM OPTIMIZATION RULES**

### **1. Page Structure (MANDATORY)**
```html
<!-- EVERY page must have this structure -->
<SEOHead 
  title="Specific Page Title | ReloFinder.ch"
  description="Compelling 155-character description with target keywords"
  canonical="https://relofinder.ch/page-url"
  keywords={['keyword1', 'keyword2', 'swiss relocation']}
  openGraph={{...}}
/>

<SchemaMarkup type="page_type" data={{...}} />
```

### **2. Content Structure for AI/LLM**
```html
<!-- H1 with primary keyword -->
<h1>How to [Primary Keyword] in Switzerland 2025</h1>

<!-- Q&A Format for AI optimization -->
<section>
  <h2>What is the cost of Swiss relocation?</h2>
  <p>The average cost of relocating to Switzerland is CHF 15,000-35,000...</p>
  
  <h2>Which are the best relocation companies in Switzerland?</h2>
  <p>The top-rated Swiss relocation companies include...</p>
</section>
```

### **3. Keyword Targeting**
**Primary Keywords (MUST include):**
- "relocation switzerland" / "moving to switzerland"
- "swiss relocation companies" 
- "relocation [city]" (zurich, geneva, basel, etc.)

**LSI Keywords:**
- "expat services switzerland"
- "international move switzerland" 
- "swiss immigration help"
- "switzerland work permit"

### **4. Schema Markup (Required)**
- **LocalBusiness** schema for company pages
- **Organization** schema for main pages  
- **FAQ** schema for Q&A content
- **Review** schema for testimonials

---

## 🎨 **COMPONENT TEMPLATES**

### **Hero Section Template**
```html
<section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
  <div class="container relative z-10 py-12 lg:py-20">
    <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <!-- Content with gradient text -->
      <h1 class="text-3xl lg:text-5xl font-bold">
        Your <span class="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">Keyword</span> Solution
      </h1>
      <!-- CTA buttons with proper gradients -->
      <a href="/contact" class="bg-gradient-to-r from-primary-600 to-primary-700 hover:scale-105 transition-all duration-300">
    </div>
  </div>
</section>
```

### **Card Template**
```html
<div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
  <div class="p-6 lg:p-8">
    <!-- Icon with brand colors -->
    <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
      <svg class="w-6 h-6 text-primary-600">...</svg>
    </div>
    <!-- Content -->
  </div>
</div>
```

---

## ✅ **QUALITY CHECKLIST**

Before submitting any page, verify:

### **Design Compliance**
- [ ] Uses ONLY approved color palette
- [ ] Includes brand gradient backgrounds  
- [ ] All icons are from approved Heroicon set
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Hover effects and animations present

### **SEO Compliance**
- [ ] SEOHead component properly configured
- [ ] Schema markup implemented
- [ ] Q&A content structure for AI optimization
- [ ] Target keywords naturally integrated
- [ ] Meta descriptions under 155 characters

### **UX Compliance**  
- [ ] Loading times under 3 seconds
- [ ] Touch targets minimum 44px on mobile
- [ ] Clear visual hierarchy with typography
- [ ] Accessibility standards met (alt text, ARIA labels)
- [ ] Smooth transitions and micro-interactions

---

## 🎯 **CONTENT STRATEGY FOR AI RANKING**

### **Question-Answer Format (MANDATORY)**
Structure all content to answer common user questions:

```markdown
## How much does relocation to Switzerland cost?
Detailed answer with specific numbers and examples...

## What documents do I need for Swiss relocation?  
Step-by-step list with requirements...

## Which Swiss cities are best for expats?
Comprehensive comparison with pros/cons...
```

### **Featured Snippet Optimization**
- Use numbered lists for processes
- Include comparison tables for costs/services
- Provide step-by-step guides
- Add location-specific information

---

**REMEMBER**: This is the ONLY design system for ReloFinder. Any deviation from these guidelines is NOT allowed. Every page must feel cohesive and maintain the premium, trustworthy brand image while being optimized for both human users and AI/LLM search ranking. 
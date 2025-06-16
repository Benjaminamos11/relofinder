# Company Content Structure Guide

## Required File Structure

Each company should have a markdown file in `src/content/companies/[company-id].md`

## Complete Company Markdown Template

```yaml
---
# === BASIC COMPANY INFO ===
id: "prime-relocation"                    # URL slug, kebab-case
name: "Prime Relocation"                  # Display name
description: "Leading Swiss relocation specialists providing comprehensive moving and settling services for individuals and corporations across all major Swiss regions."

# === LOGO & VERIFICATION ===
logo: "/images/companies/prime-relocation-logo.png"
verified: true                           # ReloFinder verified status
featured: true                           # Featured partner (shows direct contact)

# === CONTACT CONTROL SYSTEM ===
contactSettings:
  showDirectContact: true                # Override for featured status
  showWebsite: true                      # Show website button
  showPhone: true                        # Show phone button  
  showEmail: false                       # Show email button

# === CONTACT INFORMATION ===
phone: "+41 44 123 4567"
email: "info@primerelocation.ch"
website: "https://www.primerelocation.ch"
address:
  street: "Bahnhofstrasse 123"
  city: "Zurich"
  postal: "8001"
  country: "Switzerland"

# === BUSINESS DETAILS ===
founded: 2008                           # Year founded (for experience calculation)
employees: "25-50"                       # Team size
businessModel: "B2B2C"                  # Business model
certifications: 
  - "ISO 9001:2015"
  - "FIDI-FAIM Certified"
  - "Swiss Moving Association"

# === RATINGS & REVIEWS ===
rating:
  score: 4.8                            # Overall rating
  reviews: 127                          # Number of reviews
  sources: ["google", "trustpilot"]     # Review sources

# === GOOGLE INTEGRATION ===
googleMyBusinessUrl: "https://www.google.com/maps/place/PrimeRelocation/@47.3668281,8.5384901,15z/data=!4m6!3m5!1s0x47900a08f4b1f3e5:0x3e0b8a0c1c9a7a0f!8m2!3d47.3668281!4d8.5384901!16s%2Fg%2F11c6_1l9y3"
googlePlaceId: "ChIJ1abc2def3ghi4jkl5mno6pqr7stu"  # Optional: for better API calls

# === SERVICES OFFERED ===
services:
  - "housing"                           # Must match service IDs
  - "visa"
  - "banking-finance"
  - "move-management"
  - "settling-in"
  - "education"
  - "ongoing-support"

# === REGIONAL COVERAGE ===
regions:
  - "zurich"                           # Must match region IDs
  - "geneva"
  - "basel"
  - "zug"
  - "lucerne"

# === SPECIALIZATIONS ===
specializations:
  - "Corporate Relocations"
  - "Executive Transfers"
  - "International Assignments"
  - "Family Relocations"
  - "Startup Employee Moves"

# === PRICING & PACKAGES ===
pricing:
  model: "custom"                       # "fixed", "hourly", "custom", "package"
  currency: "CHF"
  packages:
    - name: "Essential Package"
      price: "2500"
      description: "Basic relocation support"
    - name: "Premium Package"  
      price: "4500"
      description: "Comprehensive relocation"
    - name: "Executive Package"
      price: "7500"
      description: "White-glove service"

# === TARGET CLIENTS ===
clientTypes:
  - "Corporate HR Teams"
  - "International Executives"
  - "Startup Employees"
  - "Expat Families"
  - "Consulting Firms"

# === COMPANY STRENGTHS ===
strengths:
  - "15+ years Swiss market experience"
  - "Multilingual team (EN/DE/FR/IT)"
  - "24/7 emergency support hotline"
  - "95% client satisfaction rate"
  - "Partnerships with major employers"

# === SEO KEYWORDS ===
keywords:
  primary: "swiss relocation services zurich"
  secondary: 
    - "corporate relocation switzerland"
    - "executive moving services"
    - "international relocation zurich"
  long_tail:
    - "relocating to switzerland from usa"
    - "company relocation services switzerland"

# === CONTENT SECTIONS ===
sections:
  - type: "services_overview"
    title: "Comprehensive Relocation Services"
    content: "Our full-service approach covers every aspect..."
    
  - type: "regional_expertise"
    title: "Swiss Regional Coverage"
    content: "Deep local knowledge across major Swiss regions..."
    
  - type: "client_testimonials"
    title: "What Our Clients Say"
    featured_reviews:
      - author: "Sarah Johnson"
        company: "Tech Corp"
        text: "Outstanding service from start to finish..."
        rating: 5
        
  - type: "process_overview"
    title: "Our Relocation Process"
    steps:
      - step: 1
        title: "Initial Consultation"
        description: "Detailed needs assessment"
      - step: 2
        title: "Custom Planning"
        description: "Tailored relocation strategy"

# === FAQ CONTENT ===
faq:
  - question: "How much does Prime Relocation charge for their services?"
    answer: "Our pricing is customized based on your specific needs. Corporate packages typically range from CHF 2,500 to CHF 7,500 depending on the scope of services required."
    
  - question: "What makes Prime Relocation different from other companies?"
    answer: "Our 15+ years of Swiss market experience, multilingual team, and 24/7 support set us apart. We maintain a 95% client satisfaction rate through personalized service."
    
  - question: "Which regions in Switzerland do you serve?"
    answer: "We provide comprehensive services across all major Swiss regions including Zurich, Geneva, Basel, Zug, and Lucerne, with local expertise in each area."
    
  - question: "How long does the relocation process take?"
    answer: "Timeline varies by complexity, but most relocations are completed within 4-8 weeks. We provide detailed timelines during consultation."

# === BLOG/CONTENT TAGS ===
contentTags:
  - "corporate-relocation"
  - "zurich-housing"
  - "swiss-visa-support"
  - "international-moving"

# === PERFORMANCE METRICS ===
metrics:
  avgResponseTime: "< 2 hours"
  successRate: "95%"
  clientRetention: "78%"
  referralRate: "45%"
  processTime: "4-8 weeks"

# === SOCIAL PROOF ===
socialProof:
  awards:
    - "Best Relocation Service 2023 - Swiss Business Awards"
    - "Top Rated on Google Reviews"
  partnerships:
    - "Preferred Partner - Credit Suisse"
    - "Authorized Provider - UBS"
  certifications:
    - "FIDI-FAIM Quality Certification"
    - "ISO 9001:2015 Quality Management"

# === COMPETITIVE ADVANTAGES ===
advantages:
  - "Only company with dedicated startup relocation team"
  - "Proprietary digital platform for tracking"
  - "Exclusive partnerships with luxury housing providers"
  - "Same-day emergency response guarantee"

---

# Company Content Body

## About Prime Relocation

Prime Relocation has been Switzerland's leading relocation specialist since 2008, serving over 2,000 successful relocations across corporate, individual, and family segments. Our comprehensive approach combines deep local expertise with international best practices.

### Our Mission
To make every relocation to Switzerland seamless, stress-free, and successful through personalized service excellence and innovative solutions.

### Company History
Founded in 2008 by relocating executives who experienced the challenges firsthand, Prime Relocation has grown from a boutique consultancy to Switzerland's most trusted relocation partner.

## Services in Detail

### Corporate Relocation Services
Our corporate division specializes in managing high-volume employee relocations for multinational companies, consulting firms, and financial institutions.

**Key Features:**
- Dedicated account management
- Volume pricing discounts
- Integration with HR systems
- Detailed reporting and analytics

### Executive Relocation Services
White-glove service for C-level executives and senior management requiring discretion and premium accommodations.

**Premium Features:**
- Personal relocation concierge
- Luxury housing portfolio access
- Priority government appointment scheduling
- 24/7 multilingual support

## Regional Expertise

### Zurich Operations
Our Zurich team specializes in financial district relocations, with deep connections to premium housing providers and international schools.

### Geneva Coverage  
Focused on diplomatic and international organization relocations, with expertise in international school placements and cross-border considerations.

## Process Excellence

### Phase 1: Discovery & Planning (Week 1)
- Comprehensive needs assessment
- Custom relocation plan development
- Timeline and budget confirmation
- Service agreement execution

### Phase 2: Pre-Arrival Preparation (Weeks 2-4)
- Visa and permit processing
- Housing search and securing
- School enrollment coordination
- Essential service setup

### Phase 3: Arrival & Settling (Weeks 5-6)
- Airport pickup and orientation
- Home setup and utilities activation
- Registration and documentation
- Integration support services

### Phase 4: Follow-up & Support (Weeks 7-8)
- 30-day check-in assessment
- Issue resolution and optimization
- Long-term support activation
- Satisfaction survey and feedback

## Success Stories

### Tech Startup Relocation
Successfully relocated 45 international employees for a major tech company expansion, achieving 100% on-time completion with 98% satisfaction rating.

### Family Integration Success
Helped relocate over 200 expat families, with 89% reporting successful integration within 90 days of arrival.

## Quality Assurance

Our ISO 9001:2015 certification ensures consistent quality across all service delivery, with regular audits and continuous improvement processes.

### Client Satisfaction Metrics
- Overall satisfaction: 95%
- Recommend to colleagues: 94%
- Would use again: 92%
- Issue resolution time: < 24 hours

## Contact Information

Ready to start your Swiss relocation journey? Contact our team for a personalized consultation and detailed service proposal.

**Zurich Office:**
Bahnhofstrasse 123, 8001 Zurich
Phone: +41 44 123 4567
Email: zurich@primerelocation.ch

**Office Hours:**
Monday - Friday: 8:00 AM - 6:00 PM
Saturday: 9:00 AM - 2:00 PM (by appointment)
Emergency Support: 24/7 hotline available
```

## File Naming Convention

- File: `src/content/companies/prime-relocation.md`
- ID must match filename (without .md)
- Use kebab-case for all IDs
- Ensure service and region IDs match existing collections

## Required Images

Place company logos in `public/images/companies/`:
- `prime-relocation-logo.png` (square format: 400x400px)
- `prime-relocation-logo-horizontal.png` (horizontal: 600x200px)
- High-resolution PNG with transparent background

## Content Validation

All fields marked as required must be completed:
- ✅ Basic info (id, name, description)
- ✅ Logo and contact details  
- ✅ Services and regions arrays
- ✅ Specializations and strengths
- ✅ FAQ content (minimum 4 questions)

## SEO Optimization

Each company page targets:
- Primary: `[company-name] reviews switzerland`
- Secondary: `[company-name] vs competitors`
- Long-tail: `[company-name] pricing relocation costs`

## Contact Control System

```yaml
# Featured Partners (show all contact options)
featured: true
contactSettings:
  showDirectContact: true
  showWebsite: true
  showPhone: true
  showEmail: true

# Standard Listings (ReloFinder contact only)
featured: false
contactSettings:
  showDirectContact: false
  showWebsite: false
  showPhone: false
  showEmail: false
```

## AI Analysis Integration

The system automatically:
1. Fetches Google reviews via SerpAPI
2. Stores reviews in Supabase
3. Generates AI analysis on demand
4. Caches results for 24 hours
5. Displays neutral, data-driven insights

## Content Updates

1. Update markdown files in `src/content/companies/`
2. Run `npm run build` to regenerate pages
3. Deploy updated static files
4. Reviews and AI analysis update automatically 
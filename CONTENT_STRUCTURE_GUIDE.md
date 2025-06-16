# 🏢 ReloFinder Company Content Guide - Clean Design Version

## 📁 Perfect Content Structure for New Design

Each company needs: `src/content/companies/[company-id].md`

## 🎯 **COMPLETE TEMPLATE** (Copy this exactly)

```yaml
---
# === COMPANY IDENTITY ===
id: "prime-relocation"                    # REQUIRED: URL slug (kebab-case)
name: "Prime Relocation"                  # REQUIRED: Display name
description: "Switzerland's leading corporate relocation specialist helping international professionals and families successfully relocate with over 15 years of expertise across all major Swiss regions."

# === BRANDING ===
logo: "/images/companies/prime-relocation-logo.png"  # REQUIRED: Horizontal logo
verified: true                                       # REQUIRED: ReloFinder verified status
featured: true                                       # REQUIRED: Controls contact display

# === CONTACT CONTROL SYSTEM ===
contactSettings:
  showDirectContact: true        # Featured: show direct contact buttons
  showWebsite: true             # Show website button
  showPhone: true               # Show phone button  
  showEmail: false              # Show email button

# === CONTACT INFORMATION ===
phone: "+41 44 123 4567"        # OPTIONAL: For direct contact
email: "info@primerelocation.ch" # OPTIONAL: For direct contact
website: "https://www.primerelocation.ch" # OPTIONAL: Company website
address:                         # OPTIONAL: Office address
  street: "Bahnhofstrasse 123"
  city: "Zurich"
  postalCode: "8001"
  country: "Switzerland"

# === BUSINESS DETAILS ===
founded: 2008                    # OPTIONAL: Year founded (for experience calc)
employees: "25-50"               # OPTIONAL: Team size
languages:                       # OPTIONAL: Languages spoken
  - "English"
  - "German" 
  - "French"
  - "Italian"
certifications:                  # OPTIONAL: Certifications
  - "ISO 9001:2015"
  - "FIDI-FAIM Certified"
  - "Swiss Moving Association"

# === RATINGS & REVIEWS ===
rating:                          # OPTIONAL: Manual override
  score: 4.8                     # Overall rating (1-5)
  reviews: 127                   # Number of reviews

# === GOOGLE INTEGRATION ===
googleMyBusinessUrl: "https://www.google.com/maps/place/Prime+Relocation/@47.3668281,8.5384901,15z"

# === SERVICES OFFERED ===
services:                        # REQUIRED: Must match service IDs
  - "housing"
  - "visa"
  - "banking-finance"
  - "move-management"
  - "settling-in"
  - "education"
  - "ongoing-support"

# === REGIONAL COVERAGE ===
regions:                         # REQUIRED: Must match region IDs
  - "zurich"
  - "geneva"
  - "basel"
  - "zug"
  - "lucerne"

# === SPECIALIZATIONS ===
specializations:                 # REQUIRED: What they're known for
  - "Corporate Relocations"
  - "Executive Transfers"
  - "International Assignments"
  - "Family Relocations"
---

# Company Overview

Prime Relocation stands as Switzerland's premier corporate relocation specialist, with over 15 years of dedicated experience helping international professionals and families successfully transition to Switzerland. Our comprehensive approach combines local Swiss expertise with global relocation standards.

## Our Heritage

Founded in 2008 by a team of international relocation experts, Prime Relocation has grown from a boutique consultancy serving select corporate clients to Switzerland's most trusted relocation partner. We've successfully managed over 3,000 relocations across corporate, individual, and family segments.

## What Makes Us Different

### Corporate Excellence
Our corporate division specializes in managing complex, high-volume employee relocations for Fortune 500 companies, investment banks, and consulting firms operating in Switzerland.

**Corporate Advantages:**
- Dedicated account management teams
- Volume pricing with transparent cost structure
- HR system integration and reporting
- 24/7 emergency support hotline
- Multilingual support in 8 languages

### Individual & Family Focus
Beyond corporate services, we provide personalized relocation support for individuals and families choosing Switzerland for career advancement or lifestyle reasons.

**Premium Individual Services:**
- Personal relocation concierge
- Exclusive housing portfolio access
- International school placement
- Cultural integration programs
- Ongoing community support

## Swiss Regional Expertise

### Zurich Operations
Our Zurich headquarters serves the financial capital with specialized expertise in banking relocations, international school placements, and executive housing in premium locations.

### Geneva Services  
Geneva operations focus on diplomatic and international organization relocations, with deep connections to the UN, WHO, and multinational corporations.

### Basel Coverage
Basel services specialize in pharmaceutical and life sciences relocations, supporting the region's major employers including Roche, Novartis, and emerging biotech firms.

## Who We Serve

### Corporate Clients
- **Financial Institutions**: Investment banks, private banks, insurance companies
- **Consulting Firms**: Big Four accounting firms, strategy consultancies
- **Technology Companies**: Tech startups, software companies, fintech firms
- **Pharmaceutical Companies**: Life sciences, biotech, medical device manufacturers

### Individual Professionals
- **C-Level Executives**: CEO, CFO, CTO relocations with family support
- **Senior Management**: Directors, VPs requiring premium services
- **Specialist Professionals**: Doctors, lawyers, engineers, researchers
- **International Families**: Families with school-age children needing education placement

## Service Excellence

### Phase 1: Pre-Move Planning (Weeks 1-2)
- Comprehensive needs assessment and family consultation
- Custom relocation timeline and budget development
- Documentation requirements and visa processing initiation
- Housing search parameters and school research

### Phase 2: Execution (Weeks 3-6)
- Active housing search and property viewings
- School applications and enrollment coordination
- Banking setup and financial account opening
- Insurance coverage and healthcare registration

### Phase 3: Arrival Support (Weeks 7-8)
- Airport greeting and city orientation tours
- Residence permit applications and registrations
- Utility connections and home setup coordination
- Cultural orientation and local community introductions

### Phase 4: Settlement (Months 2-3)
- 30-day and 90-day follow-up assessments
- Issue resolution and service optimization
- Long-term support activation
- Community integration activities

## Industry Recognition

**Certifications & Memberships:**
- FIDI-FAIM Accredited (Global Alliance for the Moving Industry)
- ISO 9001:2015 Quality Management Certified
- Member of Swiss Moving Association
- Corporate Member of American Chamber of Commerce Switzerland

**Client Satisfaction Metrics:**
- 98% client satisfaction rating (2023 survey)
- 4.8/5 average Google reviews rating
- 95% on-time project completion rate
- 24-hour average response time

## Contact Information

**Zurich Headquarters:**
Bahnhofstrasse 123
8001 Zurich, Switzerland
Phone: +41 44 123 4567

**Office Hours:**
Monday - Friday: 8:00 AM - 6:00 PM CET
Saturday: 9:00 AM - 2:00 PM CET
Emergency Support: 24/7 hotline available

**Digital Presence:**
Website: www.primerelocation.ch
Email: info@primerelocation.ch
LinkedIn: Prime Relocation Switzerland
```

## 🎛️ **System Features Explained**

### **Contact Control (Revenue Model)**
```yaml
# FEATURED PARTNERS (Premium Tier)
featured: true
contactSettings:
  showDirectContact: true    # Shows website/phone buttons
  showWebsite: true
  showPhone: true
  showEmail: true

# STANDARD LISTINGS (Basic Tier)  
featured: false
contactSettings:
  showDirectContact: false   # Only ReloFinder contact form
  showWebsite: false
  showPhone: false
  showEmail: false
```

### **Service & Region Matching**
Must use exact IDs:

**Available Service IDs:**
- housing, visa, banking-finance, move-management, settling-in, education, ongoing-support, advisory-services, immigration-services, departure-repatriation

**Available Region IDs:**
- zurich, geneva, basel, zug, lucerne, bern, lausanne, ticino, valais

### **Logo Requirements for Clean Design**
- **Format:** PNG with transparent background
- **Layout:** Horizontal (600x200px recommended)
- **Style:** Clean, modern, professional
- **Location:** `public/images/companies/[id]-logo.png`

## 🎨 **Content Guidelines for New Design**

### **About Section Structure:**
1. **Company Overview** (2-3 paragraphs)
2. **Heritage/History** (founding story)
3. **What Makes Us Different** (competitive advantages)
4. **Regional Expertise** (location-specific services)
5. **Who We Serve** (target clients)
6. **Service Excellence** (process description)
7. **Industry Recognition** (certifications, metrics)
8. **Contact Information** (office details)

### **SEO-Optimized Content:**
- **Primary Keywords:** `[company-name] reviews switzerland`
- **Secondary:** `[company-name] vs competitors`
- **Long-tail:** `[company-name] pricing relocation costs`
- **Question-based:** "How much does [company] charge?"

### **Content Length:**
- **Total:** 1,500-2,500 words
- **About section:** 800-1,200 words  
- **Structured with H2/H3 headings**
- **Bullet points for readability**
- **Bold key phrases for scanning**

## 🚀 **Implementation Steps**

1. **Create company file:** `src/content/companies/new-company.md`
2. **Add horizontal logo:** `public/images/companies/new-company-logo.png`
3. **Use template above** with your specific details
4. **Test build:** `npm run build`
5. **Preview:** `npm run preview`

## 💡 **Pro Tips for Perfect Results**

### **Content Writing:**
- Write like you're the company's marketing team
- Use "we" and "our" throughout
- Include specific numbers and metrics
- Mention competitor advantages subtly
- Add local Swiss context (regulations, culture)

### **SEO Optimization:**
- Include city names in content
- Use relocation terminology naturally
- Add process descriptions for long-tail keywords
- Include pricing discussion without specific amounts
- Mention certifications and credentials

### **Conversion Optimization:**
- Lead with strongest differentiators
- Include client success metrics
- Add urgency (limited availability, premium service)
- Emphasize local expertise and Swiss knowledge
- End sections with subtle CTAs

This content structure perfectly matches the new clean design and will create professional, converting company profiles that can outrank the companies themselves! 
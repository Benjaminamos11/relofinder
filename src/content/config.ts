// Content collections configuration for ReloFinder
import { defineCollection, z } from 'astro:content';

// Companies Collection
const companies = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    logo: z.string(),
    heroImage: z.string().url().optional(),
    website: z.string().url(),
    phone: z.string().optional(),
    email: z.string(),
    googleMyBusinessUrl: z.string().optional(), // For SerpAPI Google Reviews integration - can be URL or search query
    address: z.object({
      street: z.string(),
      city: z.string(),
      postalCode: z.string(),
      canton: z.string()
    }),
    services: z.array(z.string()), // Service IDs
    regions: z.array(z.string()), // Region IDs
    specializations: z.array(z.string()),
    languages: z.array(z.string()),
    founded: z.number().optional(),
    employees: z.string().optional(),
    verified: z.boolean().default(false),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),
    label: z.string().optional(),
    rating: z.object({
      score: z.number().min(1).max(5),
      reviews: z.number(),
      breakdown: z.object({
        communication: z.number(),
        professionalism: z.number(),
        value: z.number(),
        timeliness: z.number()
      })
    }),
    pricing: z.object({
      consultationFee: z.number().optional(),
      packagePricing: z.boolean().default(false),
      freeInitialConsult: z.boolean().default(true)
    }),
    certifications: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    // Enhanced content blocks
    highlights: z.array(z.object({
      title: z.string(),
      icon: z.string().optional(),
      points: z.array(z.string())
    })).optional(),
    milestones: z.array(z.object({
      year: z.number(),
      event: z.string()
    })).optional(),
    process: z.array(z.object({
      step: z.number(),
      title: z.string(),
      duration: z.string(),
      description: z.string(),
      icon: z.string().optional()
    })).optional(),
    testimonials: z.array(z.object({
      author: z.string(),
      role: z.string(),
      rating: z.number(),
      quote: z.string()
    })).optional(),
    stats: z.array(z.object({
      label: z.string(),
      value: z.string(),
      icon: z.string().optional()
    })).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    bestFor: z.array(z.string()).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional()
  })
});

// Services Collection - Made more flexible
const services = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    image: z.string().url().optional(),
    heroImage: z.string().url().optional(),
    featured: z.boolean().default(false),
    category: z.enum(['housing', 'immigration', 'finance', 'education', 'lifestyle', 'business']).optional(),
    pricing: z.object({
      type: z.enum(['free', 'consultation', 'package', 'hourly']),
      range: z.string().optional(),
      starting: z.number().optional()
    }).optional(),
    features: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    process: z.array(z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
      duration: z.string()
    })).optional(),
    providers: z.array(z.string()).optional(), // Company IDs
    requirements: z.array(z.string()).optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional(),
    relatedServices: z.array(z.string()).optional(),
    stats: z.object({
      providers: z.string(),
      avgTime: z.string(),
      satisfaction: z.string(),
      completionRate: z.string()
    }).optional(),
    customSlug: z.string().optional(),
    displayOrder: z.number().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});

// Regions Collection - Made more flexible
const regions = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string().optional(),
    name: z.string(),
    subtitle: z.string().optional(),
    canton: z.string().optional(),
    population: z.union([z.number(), z.string()]).optional(),
    area: z.number().optional(),
    language: z.string().optional(),
    languages: z.array(z.string()).optional(),
    image: z.string().url(),
    heroImage: z.string().url().optional(),
    featured: z.boolean().default(false),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    highlights: z.array(z.string()).optional(),
    description: z.string(),
    longDescription: z.string().optional(),
    keyFacts: z.object({
      costOfLiving: z.string(),
      avgRent: z.string(),
      taxRate: z.string(),
      internetSpeed: z.string(),
      publicTransport: z.string()
    }).optional(),
    livingCosts: z.object({
      oneBedroomApt: z.object({ min: z.number(), max: z.number() }),
      threeBedroomApt: z.object({ min: z.number(), max: z.number() }),
      utilities: z.object({ min: z.number(), max: z.number() }),
      transportation: z.number(),
      groceries: z.number(),
      dining: z.object({ budget: z.number(), midRange: z.number(), highEnd: z.number() })
    }).optional(),
    districts: z.array(z.object({
      name: z.string(),
      description: z.string(),
      characteristics: z.array(z.string()).optional(),
      avgRent: z.string().optional()
    })).optional(),
    neighborhoods: z.array(z.object({
      name: z.string(),
      description: z.string()
    })).optional(),
    companies: z.array(z.string()).optional(), // Company IDs
    relocationStats: z.object({
      expatsPercentage: z.number(),
      avgMoveTime: z.string(),
      satisfaction: z.number(),
      topIndustries: z.array(z.string())
    }).optional(),
    industries: z.array(z.string()).optional(),
    facts: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).optional(),
    cities: z.array(z.string()).optional(),
    displayOrder: z.number().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});

// Blog Collection
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    readingTime: z.number(), // in minutes
    featured: z.boolean().default(false),
    relatedRegions: z.array(z.string()).optional(),
    relatedServices: z.array(z.string()).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional()
    }).optional()
  })
});

// Reviews Collection (for Google Reviews)
const reviews = defineCollection({
  type: 'data', // Using data type for JSON
  schema: z.object({
    companyName: z.string(),
    companySlug: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    lastUpdated: z.string(),
    reviews: z.array(
      z.object({
        author: z.string(),
        authorImage: z.string().optional(),
        date: z.string(),
        content: z.string(),
        rating: z.number()
      })
    )
  })
});

// Export all collections
export const collections = {
  'companies': companies,
  'services': services,
  'regions': regions,
  'blog': blog,
  'reviews': reviews
};

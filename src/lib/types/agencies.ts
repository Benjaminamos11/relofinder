/**
 * Agency Profiles System - Type Definitions
 * ReloFinder Platform
 */

export type AgencyStatus = 'standard' | 'partner' | 'preferred';

// ============================================================
// Rich Content Type Definitions
// ============================================================

export interface PricingModel {
  consultationFee?: number;
  packagePricing: boolean;
  freeInitialConsult: boolean;
}

export interface RatingBreakdown {
  communication: number;
  professionalism: number;
  value: number;
  timeliness: number;
}

export interface Highlight {
  title: string;
  icon?: string;
  points: string[];
}

export interface Milestone {
  year: number;
  event: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
  icon?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContentBlocks {
  highlights?: Highlight[];
  milestones?: Milestone[];
  process?: ProcessStep[];
  faqs?: FAQ[];
}

export interface Stat {
  label: string;
  value: string;
  icon?: string;
}

export interface Testimonial {
  author: string;
  role: string;
  rating: number;
  quote: string;
}

export interface SocialProof {
  stats?: Stat[];
  testimonials?: Testimonial[];
}

// ============================================================
// Main Agency Interface
// ============================================================

export interface Agency {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  year_founded?: number;
  languages: string[] | null;
  website_url?: string;
  phone?: string;
  email?: string;
  meeting_url?: string;
  status?: AgencyStatus; // Legacy support
  tier: AgencyStatus;
  created_at?: string;
  updated_at?: string;
  // Rich content fields (from relocators table)
  certifications?: string[];
  pricing_model?: PricingModel | null;
  rating_breakdown?: RatingBreakdown | null;
  content_blocks?: ContentBlocks | null;
  social_proof?: SocialProof | null;
  logo?: string;
  is_verified?: boolean;
  meta_description?: string;
  phone_number?: string;
  contact_email?: string;
  website?: string;
  regions_served?: string[];
  internal_notes?: string;
  manager_name?: string;
  manager_email?: string;
  manager_phone?: string;
  address_street?: string;
  address_city?: string;
  address_zip?: string;
  founded_year?: number;
  employee_count?: string;
  services?: string[];
  offices?: Office[];
  team?: ConsultantAssignment[];
}

export interface Service {
  id: number;
  code: string;
  label: string;
}

export interface Region {
  id: number;
  code: string;
  label: string;
}

export interface Review {
  id: string;
  agency_id: string;
  user_id?: string;
  rating: number; // 1-5
  title?: string;
  body?: string;
  service_code?: string;
  created_at: string;
  updated_at?: string;
  is_published: boolean;
  is_verified: boolean;
  // Computed fields
  author_name?: string;
  helpful_count?: number;
  reply?: ReviewReply;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  agency_id: string;
  author_name?: string;
  body: string;
  created_at: string;
}

export interface ExternalReviewSnapshot {
  id: string;
  agency_id: string;
  source: 'google' | 'linkedin' | 'facebook' | string;
  rating: number;
  review_count: number;
  payload?: Record<string, any>;
  captured_at: string;
}

export interface ReviewSummary {
  agency_id: string;
  summary?: string;
  positives?: string[];
  negatives?: string[];
  updated_at: string;
}

export interface Lead {
  id?: string;
  agency_id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  region_code?: string;
  service_code?: string;
  source_page?: string;
  sent_to_agency?: boolean;
  requested_agencies?: string[]; // Array of agency IDs or Names
  assigned_agencies?: string[]; // Array of agency IDs or Names
  status?: string; // 'new' | 'pending_review' | 'distributed' | 'quotes_received'
  created_at?: string;
}

export interface Office {
  id?: string;
  relocator_id?: string;
  street: string;
  city: string;
  zip: string;
  is_main: boolean;
  created_at?: string;
}

export interface Consultant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
}

export interface ConsultantAssignment {
  consultant_id: string;
  relocator_id: string;
  role?: string;
  is_primary?: boolean;
  // Join data
  consultant?: Consultant;
}

export interface AgencyWithRelations extends Omit<Agency, 'services'> {
  services: Service[];
  regions: Region[];
}

export interface WeightedRating {
  overall: number;
  internal_avg: number;
  internal_count: number;
  external_avg: number;
  external_count: number;
}

export interface AgencyProfileData {
  agency: AgencyWithRelations;
  rating: WeightedRating;
  reviews: Review[];
  summary?: ReviewSummary;
  alternatives: AgencyWithRelations[];
}


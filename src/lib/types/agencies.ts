/**
 * Agency Profiles System - Type Definitions
 * ReloFinder Platform
 */

export type AgencyStatus = 'standard' | 'partner' | 'preferred';

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
  status: AgencyStatus;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
}

export interface AgencyWithRelations extends Agency {
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


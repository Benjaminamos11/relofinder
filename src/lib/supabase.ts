/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe database client
export type Database = {
  public: {
    Tables: {
      agencies: any;
      services: any;
      regions: any;
      agency_services: any;
      agency_regions: any;
      reviews: any;
      review_replies: any;
      review_votes: any;
      external_reviews: any;
      review_summaries: any;
      leads: any;
    };
  };
};

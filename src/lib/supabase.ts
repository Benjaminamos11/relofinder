/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase env vars not configured. Features requiring Supabase will not work.');
  console.warn('Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your environment or .env file');
} else {
  console.log('✅ Supabase Client Initialized with URL:', import.meta.env.PUBLIC_SUPABASE_URL);
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

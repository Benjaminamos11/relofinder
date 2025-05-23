import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

// For static builds, we create a dummy client if variables are missing
// The client will be properly initialized on the client-side when needed
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase environment variables not found - client not initialized');
}

export { supabase };

// Helper function to create client with custom config
export function createSupabaseClient(url?: string, key?: string) {
  const finalUrl = url || supabaseUrl;
  const finalKey = key || supabaseKey;
  
  if (!finalUrl || !finalKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(finalUrl, finalKey);
}
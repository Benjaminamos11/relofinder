/**
 * Server-side Supabase client (service role key — bypasses RLS)
 * Lazy-initialized to ensure env vars are available at runtime.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_client) {
      const url = import.meta.env.PUBLIC_SUPABASE_URL;
      const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
      console.log('[supabase-admin] Initializing client:', { hasUrl: !!url, hasKey: !!key });
      if (!url || !key) {
        throw new Error(`Supabase not configured: URL=${!!url}, KEY=${!!key}`);
      }
      _client = createClient(url, key);
    }
    return (_client as any)[prop];
  },
});

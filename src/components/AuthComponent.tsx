import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';

export default function AuthComponent() {
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    setSupabase(client);
  }, []);

  if (!supabase) return null;

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={[]}
      redirectTo={`${import.meta.env.SITE}/admin`}
    />
  );
}
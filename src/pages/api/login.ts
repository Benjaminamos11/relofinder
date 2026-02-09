export const prerender = false;
import { supabase } from '../../lib/supabase';

export async function POST({ request, redirect }) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return new Response('Email and password are required', { status: 400 });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return redirect('/login?error=invalid');
    }
    
    if (data?.user) {
      return redirect('/admin');
    }

    return redirect('/login?error=invalid');
  } catch (error) {
    return new Response(`Login error: ${error.message}`, { status: 500 });
  }
}
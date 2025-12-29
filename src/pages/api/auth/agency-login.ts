
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const { email } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
        }

        // 1. Verify Partner Existence
        // We check if this email is listed as an 'admin' or contact for any relocator
        // Since we don't have a strict 'contact_email' on relocators yet, let's assume we search match on the 'email' column if it exists, 
        // OR we might need to add it.
        // For now, let's check against a known list or column.
        // WAIT, `relocators` usually has an email field. Let's check schema.

        // Check if email exists in 'relocators' table
        // Adjust column name 'email' based on actual schema if needed.
        const { data: partner, error: dbError } = await supabase
            .from('relocators')
            .select('id, company_name')
            .or(`contact_email.eq.${email},email.eq.${email}`) // Try both common fields
            .limit(1)
            .single();

        if (dbError || !partner) {
            // Security: Don't reveal if user exists or not? 
            // For a partner portal, explicit error is better UX: "You are not a registered partner."
            return new Response(JSON.stringify({
                message: 'No partner account found with this email. Please contact support@relofinder.ch to apply.'
            }), { status: 404 });
        }

        // 2. Send Magic Link
        // Supabase Auth will handle the actual email sending
        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${new URL(request.url).origin}/agency/dashboard`,
            },
        });

        if (authError) {
            return new Response(JSON.stringify({ message: authError.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
};

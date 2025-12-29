
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const { email } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
        }

        const domain = email.split('@')[1];
        if (!domain) {
            return new Response(JSON.stringify({ message: 'Invalid email address' }), { status: 400 });
        }

        // 1. Verify Partner Existence via Email OR Domain
        // We check against contact_email, specific email column, OR website domain match
        const { data: partner, error: dbError } = await supabase
            .from('relocators')
            .select('id, name')
            .or(`contact_email.eq.${email},website.ilike.%${domain}%`)
            .limit(1)
            .single();

        if (dbError || !partner) {
            console.warn(`Login attempt failed for ${email} (Domain: ${domain}) - Not found`);
            return new Response(JSON.stringify({
                message: 'No partner account found matching this email or domain. Please contact support@relofinder.ch.'
            }), { status: 404 });
        }

        console.log(`Login attempt for ${email} matched partner: ${partner.name}`);

        // 2. Send Magic Link
        // NOTE: Uses Supabase default email template because explicit 'MagicLinkEmail' 
        // template sending requires Service Role Key to generate tokens manually.
        // To use the custom template, Supabase SMTP must be configured to use Resend.
        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${new URL(request.url).origin}/agency/dashboard`,
            },
        });

        if (authError) {
            return new Response(JSON.stringify({ message: authError.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, companyName: partner.name }), { status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
};

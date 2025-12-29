
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import MagicLinkEmail from '../../../emails/MagicLinkEmail';

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

        // 2. Custom Magic Link Generation (Preferred)
        // Checks if Service Role Key is available to generate a custom link
        const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (serviceRoleKey) {
            const adminSupabase = createClient(
                import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL,
                serviceRoleKey,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
                type: 'magiclink',
                email: email,
                options: {
                    redirectTo: `${new URL(request.url).origin}/agency/dashboard`
                }
            });

            if (linkError || !linkData.properties?.action_link) {
                console.error("Failed to generate magic link:", linkError);
                return new Response(JSON.stringify({ message: "Failed to generate login link." }), { status: 500 });
            }

            // Send Custom Email via Resend
            const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);

            // Using 'as any' to bypass strict return type check for Resend SDK version differences
            const { error: emailError } = await resend.emails.send({
                from: 'ReloFinder <onboarding@relofinder.ch>', // Verified domain
                to: email,
                subject: 'Your Partner Login Link',
                react: MagicLinkEmail({
                    magicLink: linkData.properties.action_link,
                    companyName: partner.name
                }) as any,
            }) as any;

            if (emailError) {
                console.error("Resend Error:", emailError);
                // Fallback? Or just error. Better to error so we know.
                return new Response(JSON.stringify({ message: "Failed to send email." }), { status: 500 });
            }

            console.log("✅ Sent custom Magic Link email via Resend");
        } else {
            console.log("⚠️ No Service Role Key found. Sending default Supabase email.");

            // Fallback: Default Supabase Email
            const { error: authError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${new URL(request.url).origin}/agency/dashboard`,
                },
            });

            if (authError) {
                return new Response(JSON.stringify({ message: authError.message }), { status: 500 });
            }
        }

        return new Response(JSON.stringify({ success: true, companyName: partner.name }), { status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
};

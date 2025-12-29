import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Server-side)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Email sending helper
async function sendEmailViaEdgeFunction(to: string, subject: string, text: string, html?: string) {
    const apiUrl = `${supabaseUrl}/functions/v1/send-email`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, text, html }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Failed to send email:', err);
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const {
            firstname,
            lastname,
            email,
            subject,
            message
        } = body;

        // 1. Basic Validation
        if (!email || !firstname) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const fullName = `${firstname} ${lastname}`.trim();

        // 2. Insert into DB (corporate_leads table used as catch-all for B2B)
        const { data, error } = await supabase
            .from('corporate_leads')
            .insert([
                {
                    company_name: 'Partner Inquiry',
                    hr_name: fullName,
                    hr_email: email,
                    hr_title: subject || 'Partner Application',
                    specific_request: message,
                    status: 'new',
                    metadata: {
                        source: 'partner_application',
                        type: 'partner'
                    }
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        // 3. Admin Notification
        const adminHtml = `
      <h2>New Partner Inquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type:</strong> ${subject || 'General'}</p>
      <hr />
      <p><strong>Message:</strong><br/>${message}</p>
    `;
        await sendEmailViaEdgeFunction('hello@relofinder.ch', `Partner Inquiry: ${fullName}`, 'New Partner Lead', adminHtml);

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (e: any) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
    }
}

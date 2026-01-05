import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Server-side)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Email sending helper (reusing logic pattern from utils/email.ts but adapted for server-side env vars if needed)
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
        // Don't throw, just log so we don't block the UI success state
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const {
            companyName,
            hrName,
            hrTitle,
            hrEmail,
            movesPerYear,
            painPoints,
            destinations,
            specificRequest,
            services,
            requestedAgencies // Added
        } = body;

        // 1. Basic Validation
        if (!hrEmail || !companyName) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // 2. Insert into DB
        const { data, error } = await supabase
            .from('corporate_leads')
            .insert([
                {
                    company_name: companyName,
                    hr_name: hrName,
                    hr_title: hrTitle,
                    hr_email: hrEmail,
                    moves_per_year: movesPerYear,
                    pain_points: painPoints,
                    destinations: destinations,
                    specific_request: specificRequest,
                    status: 'new',
                    requested_agencies: requestedAgencies || [],
                    metadata: {
                        services_requested: services
                    }
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        // 3. Send Emails (Fire and forget, but await to ensure execution context stays alive)

        // Admin Notification
        const adminHtml = `
      <h2>New Corporate RFP</h2>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Contact:</strong> ${hrName} (${hrTitle})</p>
      <p><strong>Email:</strong> ${hrEmail}</p>
      <p><strong>Volume:</strong> ${movesPerYear}</p>
      <hr />
      <p><strong>Services:</strong> ${services?.join(', ') || 'None specified'}</p>
      <p><strong>Pain Points:</strong> ${painPoints?.join(', ')}</p>
      <p><strong>Destinations:</strong> ${destinations?.join(', ')}</p>
      <p><strong>Requested Agencies:</strong> ${requestedAgencies?.join(', ') || 'None'}</p>
      <p><strong>Request:</strong><br/>${specificRequest}</p>
    `;
        await sendEmailViaEdgeFunction('bw@relofinder.ch', `Corporate RFP: ${companyName}`, 'New Corporate Lead', adminHtml);

        // User Confirmation
        const userHtml = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Benchmarks Request Received</h2>
        <p>Dear ${hrName},</p>
        <p>Thank you for contacting Relofinder Corporate Services.</p>
        <p>We have received your request for <strong>${companyName}</strong>. Our team is currently auditing the market based on your parameters:</p>
        <ul>
            <li>Volume: ${movesPerYear}</li>
            <li>Destinations: ${destinations?.join(', ')}</li>
        </ul>
        <p><strong>Next Steps:</strong></p>
        <p>You will receive 3 curated corporate proposals via email within 24 hours.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>The Relofinder Corporate Team</strong></p>
      </div>
    `;
        await sendEmailViaEdgeFunction(hrEmail, 'Your Relocation Benchmark Request - Received', 'Request Received', userHtml);

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (e: any) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
    }
}

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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

        // Support both unified name or split firstName/lastName
        const fullName = body.name || (body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : (body.firstName || body.lastName || ''));

        const {
            email,
            phone,
            message,
            movingFrom,
            movingTo,
            moveDate,
            reason,
            services,
            // New fields
            household,
            budget,
            employer,
            isAnonymous,
            // Context
            canton,
            agencies,
            source_page,
            utm_source,
            utm_medium,
            utm_campaign
        } = body;

        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
                    name: fullName,
                    email,
                    phone,
                    current_country: movingFrom,
                    destination_canton: movingTo || canton,
                    move_date: moveDate ? new Date(moveDate) : null,
                    intent: reason,
                    services_needed: services,
                    source_page: source_page || 'quote_request_modal',
                    status: 'new',
                    message: message || (isAnonymous ? 'User requested ANONYMOUS quote collection.' : undefined),
                    utm_source,
                    utm_medium,
                    utm_campaign,
                    metadata: {
                        household,
                        budget_tier: budget,
                        employer,
                        is_anonymous: isAnonymous,
                        target_agencies: agencies
                    }
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        // Send Email Notifications
        const adminHtml = `
            <h2>New Individual Lead Submission</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Moving From:</strong> ${movingFrom || 'N/A'}</p>
            <p><strong>Moving To:</strong> ${movingTo || canton || 'N/A'}</p>
            <p><strong>Move Date:</strong> ${moveDate || 'N/A'}</p>
            <p><strong>Reason:</strong> ${reason || 'N/A'}</p>
            <p><strong>Services:</strong> ${services?.join(', ') || 'N/A'}</p>
            <p><strong>Message:</strong> ${message || 'N/A'}</p>
        `;

        await sendEmailViaEdgeFunction('bw@relofinder.ch', `New Lead: ${fullName}`, 'New Individual Lead', adminHtml);
        await sendEmailViaEdgeFunction('hello@relofinder.ch', `New Lead: ${fullName}`, 'New Individual Lead', adminHtml);

        return new Response(JSON.stringify({ success: true, lead: data?.[0] }), { status: 200 });

    } catch (e: any) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
    }
}

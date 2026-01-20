import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Server-side)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sendEmailViaEdgeFunction(to: string, subject: string, text: string, html?: string) {
    const apiUrl = `${supabaseUrl}/functions/v1/send-email`;

    try {
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
    } catch (e) {
        console.error('Email service unreachable:', e);
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const {
            selectedService,
            selectedDestination,
            data // This is the AssessmentData object
        } = body;

        // 1. Basic Validation
        if (!data.email || !data.firstName) {
            return new Response(JSON.stringify({ error: 'Missing first name and email' }), { status: 400 });
        }

        // 2. Insert into Supabase
        const { data: lead, error } = await supabase
            .from('leads')
            .insert([
                {
                    name: data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName,
                    email: data.email,
                    phone: data.phone,
                    service_interest: selectedService,
                    region_interest: selectedDestination,
                    household_type: data.householdType,
                    funding_type: data.funding,
                    citizenship_status: data.citizenship,
                    company_name: data.companyName,
                    budget_range: data.budget,
                    metadata: {
                        ...data,
                        complexity: data.complexity,
                        source: 'concierge_assessment'
                    },
                    status: 'new'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        // 3. Send Admin Notification Email
        const adminEmail = 'bw@relofinder.ch';
        const subject = `New Assessment Lead: ${data.firstName} ${data.lastName} (${selectedService})`;

        const details = Object.entries(data)
            .filter(([key]) => !['firstName', 'lastName', 'email', 'phone'].includes(key))
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join('');

        const adminHtml = `
            <h2>New Concierge assessment Submission</h2>
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Service:</strong> ${selectedService}</p>
                <p><strong>Destination:</strong> ${selectedDestination}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                ${details}
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><a href="https://relofinder.ch/admin/leads/${lead.id}" style="display: inline-block; padding: 10px 20px; bg: #FF5A5F; color: white; text-decoration: none; border-radius: 5px;">View in Admin Panel</a></p>
            </div>
        `;

        await sendEmailViaEdgeFunction(adminEmail, subject, `New Lead from ${data.firstName}`, adminHtml);

        return new Response(JSON.stringify({ success: true, leadId: lead.id }), { status: 200 });

    } catch (e: any) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

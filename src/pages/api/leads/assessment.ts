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

        const isCorporate = selectedService.toLowerCase() === 'corporate';

        if (isCorporate) {
            // CORPORATE BRANCH
            const { data: lead, error } = await supabase
                .from('corporate_leads')
                .insert([
                    {
                        hr_name: data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName,
                        hr_email: data.email,
                        hr_title: data.jobTitle,
                        company_name: data.companyName,
                        moves_per_year: data.corpVolume,
                        pain_points: data.corpPainPoints,
                        destinations: data.corpRegions,
                        status: 'new',
                        metadata: {
                            ...data,
                            source: 'corporate_assessment',
                            outcome: data.corpOutcome
                        }
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Corporate Supabase Insert Error:', error);
                return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }

            // Email Notifications for Corporate
            const adminEmail = 'bw@relofinder.ch';
            const subject = `Corporate RFP: ${data.companyName} (${data.corpOutcome})`;
            const adminHtml = `
                <h2>New Corporate RFP Summary</h2>
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <p><strong>Company:</strong> ${data.companyName}</p>
                    <p><strong>Contact:</strong> ${data.firstName} ${data.lastName} (${data.jobTitle})</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Volume:</strong> ${data.corpVolume}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Preferred Regions:</strong> ${data.corpRegions?.join(', ')}</p>
                    <p><strong>Services Needed:</strong> ${data.corpScope?.join(', ')}</p>
                    <p><strong>Bottlenecks:</strong> ${data.corpPainPoints?.join(', ')}</p>
                    <p><strong>Requested Outcome:</strong> ${data.corpOutcome === 'tender' ? 'Anonymous Market Tender' : 'Expert Consultation'}</p>
                </div>
            `;

            const userHtml = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Benchmarks Request Received</h2>
                    <p>Dear ${data.firstName},</p>
                    <p>Thank you for contacting Relofinder Corporate Services.</p>
                    <p>We have received your request for <strong>${data.companyName}</strong>. Our team is currently auditing the market based on your parameters:</p>
                    <ul>
                        <li>Volume: ${data.corpVolume}</li>
                        <li>Destinations: ${data.corpRegions?.join(', ')}</li>
                    </ul>
                    <p><strong>Next Steps:</strong></p>
                    <p>${data.corpOutcome === 'tender'
                    ? 'You will receive an anonymized market comparison with 5+ competitive offers via email within 24 hours.'
                    : 'A Relofinder consultant will reach out to schedule your 15-minute scoping call shortly.'}</p>
                    <br />
                    <p>Best regards,</p>
                    <p><strong>The Relofinder Corporate Team</strong></p>
                </div>
            `;

            await sendEmailViaEdgeFunction(adminEmail, subject, `New Corporate Lead from ${data.companyName}`, adminHtml);
            await sendEmailViaEdgeFunction(data.email, 'Your Relocation Benchmark Request - Received', 'Request Received', userHtml);

            return new Response(JSON.stringify({ success: true, leadId: lead.id }), { status: 200 });

        } else {
            // INDIVIDUAL BRANCH (Existing)
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
                console.error('Individual Supabase Insert Error:', error);
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
        }

    } catch (e: any) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

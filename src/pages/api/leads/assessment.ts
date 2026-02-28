export const prerender = false;
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

            sendEmailViaEdgeFunction(adminEmail, subject, `New Corporate Lead from ${data.companyName}`, adminHtml).catch(console.error);
            sendEmailViaEdgeFunction(data.email, 'Your Relocation Benchmark Request - Received', 'Request Received', userHtml).catch(console.error);

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

            // Helper to get human-readable labels
            const getLabel = (key: string) => {
                const labels: Record<string, string> = {
                    householdType: 'Household Type',
                    area: 'Preferred Area',
                    budget: 'Monthly Budget',
                    engagement: 'Engagement Type',
                    citizenship: 'Citizenship Status',
                    purpose: 'Relocation Purpose',
                    employment: 'Employment Status',
                    ages: 'Children Ages',
                    system: 'Schooling System',
                    priority: 'Main Priority',
                    tempHousing: 'Needs Temp Housing',
                    vipBudget: 'Service Budget',
                    funding: 'Funding Source',
                    when: 'Move Timeframe'
                };
                return labels[key] || key;
            };

            const details = Object.entries(data)
                .filter(([key, value]) => {
                    // Exclude personal info (already in header) and empty/irrelevant keys
                    const isPersonalInfo = ['firstName', 'lastName', 'email', 'phone'].includes(key);
                    const hasValue = value !== '' && value !== null && value !== undefined && (Array.isArray(value) ? value.length > 0 : true);
                    return !isPersonalInfo && hasValue;
                })
                .map(([key, value]) => `<p><strong>${getLabel(key)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</p>`)
                .join('');

            const adminHtml = `
                <h2 style="color: #333;">New Concierge Assessment Submission</h2>
                <div style="font-family: sans-serif; padding: 25px; border: 1px solid #eee; border-radius: 12px; background-color: #fcfcfc;">
                    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                    <p><strong>Service:</strong> ${selectedService}</p>
                    <p><strong>Destination:</strong> ${selectedDestination}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <h3 style="color: #666; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;">Assessment Details</h3>
                    ${details || '<p>No additional details provided.</p>'}
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><a href="https://relofinder.ch/admin/leads/${lead.id}" style="display: inline-block; padding: 12px 24px; background-color: #FF5A5F; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Admin Panel</a></p>
                </div>
            `;

            sendEmailViaEdgeFunction(adminEmail, subject, `New Lead from ${data.firstName}`, adminHtml).catch(console.error);

            return new Response(JSON.stringify({ success: true, leadId: lead.id }), { status: 200 });
        }

    } catch (e: any) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

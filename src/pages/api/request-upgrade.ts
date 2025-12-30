
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    try {
        const { partnerId, partnerName, partnerEmail, message } = await request.json();

        if (!partnerId || !partnerName) {
            return new Response(JSON.stringify({ error: 'Missing Required Fields' }), { status: 400 });
        }

        const { data, error }: any = await resend.emails.send({
            from: 'Relofinder Partner Portal <system@relofinder.ch>',
            to: ['partner@relofinder.ch'],
            reply_to: partnerEmail,
            subject: `Upgrade Request: ${partnerName}`,
            html: `
        <h2>New Partner Upgrade Request</h2>
        <p><strong>Company:</strong> ${partnerName}</p>
        <p><strong>Partner ID:</strong> ${partnerId}</p>
        <p><strong>Email:</strong> ${partnerEmail}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message || 'No specific message provided.'}</p>
        <br />
        <p><em>Sent from Partner Dashboard Upsell Screen</em></p>
      `
        });

        if (error) {
            console.error('Resend Error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, id: data?.id }), { status: 200 });

    } catch (err: any) {
        console.error('API Error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

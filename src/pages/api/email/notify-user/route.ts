import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import QuotesReady from '../../../../emails/QuotesReady';

export const prerender = false;

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST({ request }: { request: Request }) {
    try {
        const { leadId } = await request.json();

        if (!leadId) {
            return new Response(JSON.stringify({ error: 'Missing leadId' }), { status: 400 });
        }

        // 1. Fetch Lead Details
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (leadError || !lead) {
            return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404 });
        }

        if (!lead.email) {
            return new Response(JSON.stringify({ error: 'Lead has no email' }), { status: 400 });
        }

        // 2. Count Submitted Quotes
        const { count, error: countError } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('lead_id', leadId)
            .eq('status', 'submitted');

        if (countError) {
            console.error('Error counting quotes:', countError);
        }

        const quoteCount = count || 0;

        // 3. Send Email
        // Link uses lead.id as the token (as verified in UserDashboard.tsx RPC call)
        const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL}/my-move?token=${lead.id}`;
        const firstName = lead.name ? lead.name.split(' ')[0] : 'Client';

        const { data: emailData, error: emailError } = (await resend.emails.send({
            from: 'ReloFinder Team <support@relofinder.ch>',
            to: [lead.email],
            subject: `Your Quotes are Ready (${quoteCount})`,
            react: QuotesReady({
                userName: firstName,
                dashboardLink: dashboardLink,
                agencyCount: quoteCount,
            }) as any,
        })) as any;

        if (emailError) {
            console.error('Resend Error:', emailError);
            return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Notify User Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

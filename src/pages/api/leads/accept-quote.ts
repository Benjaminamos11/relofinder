export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

// Mock Email Function (Replace with actual email service later)
async function sendAgencyWinEmail(agencyEmail: string | undefined, lead: any, price: number) {
    console.log(`[EMAIL] To Agency: CONGRATS! ${lead.first_name} accepted your quote of CHF ${price}.`);
}

async function sendAdminWinEmail(lead: any, agency: any) {
    console.log(`[EMAIL] To Admin: Deal Made! ${lead.first_name} -> ${agency.name}`);
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { quoteId } = body;

        if (!quoteId) {
            return new Response(JSON.stringify({ error: 'Quote ID is required' }), { status: 400 });
        }

        // 1. Fetch the quote to verify and get details
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('*, agency:agencies(*), lead:leads(*)')
            .eq('id', quoteId)
            .single();

        if (fetchError || !quote) {
            return new Response(JSON.stringify({ error: 'Quote not found' }), { status: 404 });
        }

        // 2. Update status
        const { error: updateError } = await supabase
            .from('quotes')
            .update({ status: 'accepted' })
            .eq('id', quoteId);

        if (updateError) {
            return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 });
        }

        // 3. Trigger Notifications (Fire and forget in standard Node/Vercel, but await here for safety in Serverless)
        // In a real app, use a queue or separate service.
        await sendAgencyWinEmail(quote.agency?.email, quote.lead, quote.price);
        await sendAdminWinEmail(quote.lead, quote.agency);

        // 4. Return Redirect URL
        return new Response(JSON.stringify({
            success: true,
            redirectUrl: quote.meeting_link || 'https://calendly.com'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Accept Quote API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

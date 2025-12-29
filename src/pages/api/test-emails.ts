import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { RequestReceived } from '../../emails/RequestReceived';
import { QuotesReady } from '../../emails/QuotesReady';
import { MeetingConfirmed } from '../../emails/MeetingConfirmed';
import { AgencyOpportunity } from '../../emails/AgencyOpportunity';
import { AgencyWin } from '../../emails/AgencyWin';
import { AdminAlert } from '../../emails/AdminAlert';

import { MagicLinkEmail } from '../../emails/MagicLinkEmail';

const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);
const TO_EMAIL = 'bw@expat-savvy.ch';

export const GET: APIRoute = async () => {
    try {
        const emails = [
            {
                subject: 'Relofinder: Sign In Link',
                react: MagicLinkEmail({ magicLink: 'https://relofinder.ch/api/auth/verify?token=test_token' })
            },
            {
                subject: 'Relofinder: Request Received',
                react: RequestReceived({ userName: 'Ben', destination: 'Zurich' })
            },
            {
                subject: 'Relofinder: Quotes Ready',
                react: QuotesReady({ userName: 'Ben', dashboardLink: 'https://relofinder.ch/my-move', agencyCount: 3 })
            },
            {
                subject: 'Relofinder: Meeting Confirmed',
                react: MeetingConfirmed({ userName: 'Ben', agencyName: 'Prime Relocation', calendlyLink: 'https://calendly.com' })
            },
            {
                subject: 'Relofinder: New Agency Opportunity',
                react: AgencyOpportunity({ leadSummary: { origin: 'London', destination: 'Zug', familySize: 'Family of 4', moveDate: 'March 1st' }, quoteLink: 'https://relofinder.ch/agency' })
            },
            {
                subject: 'Relofinder: You Won a Client!',
                react: AgencyWin({ agencyName: 'Prime Relocation', clientDetails: { name: 'Ben Wagner', email: 'bw@expat-savvy.ch', phone: '+4179000000', moveDate: 'ASAP' } })
            },
            {
                subject: 'Relofinder: Admin Alert',
                react: AdminAlert({ type: 'New Lead', data: { id: 'lead_123', name: 'Ben Wagner', source: 'Organic' } })
            }
        ];

        const results = await Promise.all(emails.map(email =>
            resend.emails.send({
                from: 'Relofinder <hello@relofinder.ch>',
                to: TO_EMAIL,
                subject: email.subject,
                react: email.react as any,
                text: ''
            })
        ));

        return new Response(JSON.stringify({ success: true, results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

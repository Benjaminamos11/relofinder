import { Resend } from 'npm:resend@1.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get request body
    const payload: EmailPayload = await req.json();

    // Send email
    const data = await resend.emails.send({
      from: 'ReloFinder <info@relofinder.ch>',
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
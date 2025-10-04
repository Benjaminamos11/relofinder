// Submit Lead Edge Function
// Handles contact form submissions with tier-based routing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { relocator_id, name, email, phone, message, service_interest, region_interest, source_page } = await req.json();

    // Validation
    if (!relocator_id || !name || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: relocator_id, name, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get relocator tier
    const { data: relocator, error: relocatorError } = await supabaseClient
      .from('relocators')
      .select('tier, email, phone, name')
      .eq('id', relocator_id)
      .single();

    if (relocatorError || !relocator) {
      return new Response(
        JSON.stringify({ error: 'Agency not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if lead should be sent to agency
    const shouldSendToAgency = relocator.tier === 'partner' || relocator.tier === 'preferred';

    // Insert lead
    const { data, error } = await supabaseClient
      .from('leads')
      .insert({
        relocator_id,
        name,
        email,
        phone: phone || null,
        message: message || null,
        service_interest: service_interest || null,
        region_interest: region_interest || null,
        source_page: source_page || null,
        sent_to_agency: shouldSendToAgency,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email notification to agency (Partner/Preferred only)
    if (shouldSendToAgency && relocator.email) {
      try {
        // Call send-email function
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            to: relocator.email,
            subject: `New lead from ReloFinder: ${name}`,
            html: `
              <h2>New Contact Request</h2>
              <p>You have received a new lead from <strong>ReloFinder</strong>:</p>
              <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
                ${service_interest ? `<li><strong>Service Interest:</strong> ${service_interest}</li>` : ''}
                ${region_interest ? `<li><strong>Region Interest:</strong> ${region_interest}</li>` : ''}
              </ul>
              ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
              <p>Please respond to this lead as soon as possible.</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                This lead was submitted via your ${relocator.tier} partner profile on ReloFinder.ch
              </p>
            `,
          }),
        });
        
        console.log(`Email sent to ${relocator.email} for lead ${data.id}`);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead: data,
        sent_to_agency: shouldSendToAgency 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in submit-lead function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


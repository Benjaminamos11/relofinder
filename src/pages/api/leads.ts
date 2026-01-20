/**
 * API Route: POST /api/leads
 * Create a new lead submission
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import type { Lead } from '../../lib/types/agencies';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as Lead;

    // Validate required fields
    if (!body.name || !body.email) {
      return new Response(JSON.stringify({
        error: 'Name and email are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        relocator_id: body.agency_id || null,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        message: body.message || null,
        region_interest: body.region_code || null,
        service_interest: body.service_code || null,
        source_page: body.source_page || null,
        sent_to_agency: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating lead:', error);
      return new Response(JSON.stringify({
        error: 'Failed to create lead'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If agency is partner/preferred, forward lead
    if (body.agency_id) {
      const { data: relocator } = await supabase
        .from('relocators')
        .select('tier, email, name')
        .eq('id', body.agency_id)
        .single();
      // Note: database uses 'tier' instead of 'status' for relocators?
      // Let's check relocators schema again.

      if (relocator && ['partner', 'preferred'].includes(relocator.tier)) {
        // TODO: Send email or webhook to agency
        console.log(`[Lead Forward] Would send lead ${lead.id} to ${relocator.name} (${relocator.email})`);

        // Mark as sent
        await supabase
          .from('leads')
          .update({ sent_to_agency: true })
          .eq('id', lead.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      lead_id: lead.id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in /api/leads:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


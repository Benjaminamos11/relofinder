/**
 * API Endpoint: Submit Lead
 * Handles quote and consultation request submissions
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();

    const { mode, context, contact, move, services, notes, source_context } = payload;

    // Validation
    if (!mode || !contact || !move || !services) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate services array
    if (!Array.isArray(services) || services.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one service must be selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get IP hash for anti-spam (basic implementation)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const enhancedContext = {
      ...source_context,
      ip_hash: await hashIP(clientIP),
      timestamp: new Date().toISOString(),
    };

    let result;

    if (mode === 'quotes') {
      // Insert lead
      const { data, error } = await supabase
        .from('leads')
        .insert({
          source_page: source_context?.page || 'quote_wizard',
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          current_country: move.from,
          destination_canton: move.to,
          move_date: move.date ? new Date(move.date) : null,
          intent: 'relocation',
          services_needed: services,
          message: notes,
          status: 'new',
          metadata: {
            ...enhancedContext,
            household: move.household,
            budget: move.budget
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting lead:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to submit request' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      result = data;

      // Route lead to partners
      await routeLead(data.id, mode, context, services, move.to);

      // Increment KPI counter
      await incrementKPI('matches_count');

    } else if (mode === 'consultation') {
      // Determine target company
      let targetCompanyId = null;

      if (context.type === 'profile' && context.companyId) {
        targetCompanyId = context.companyId;
      } else {
        // Default to Prime Relocation
        targetCompanyId = 'prime-relocation';
      }

      // Insert as lead with specific relocator_id if consultation
      const { data, error } = await supabase
        .from('leads')
        .insert({
          source_page: source_context?.page || 'consultation_request',
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          current_country: move.from,
          destination_canton: move.to,
          relocator_id: targetCompanyId === 'prime-relocation' ? null : targetCompanyId, // Link to agency if specific
          intent: 'consultation',
          services_needed: services,
          message: notes,
          status: 'new',
          metadata: {
            ...enhancedContext,
            target_company: targetCompanyId
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting consultation lead:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to submit request' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      result = data;

      // Route lead to target company
      await routeLead(data.id, mode, context, services, move.to, targetCompanyId);

      // Increment KPI counter
      await incrementKPI('consultations_booked');
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        message: 'Request submitted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Submit lead error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Route lead to appropriate partners
 */
async function routeLead(
  leadId: string,
  mode: string,
  context: any,
  services: string[],
  destination: string,
  targetCompanyId?: string | null
) {
  try {
    // For consultation with specific company, notify only that company
    if (mode === 'consultation' && targetCompanyId) {
      await notifyPartner(targetCompanyId, leadId, mode);
      return;
    }

    // For quotes, match partners based on routing rules
    const region = extractRegion(destination, context);
    const partnerIds = await getMatchingPartners(region, services);

    // Notify partners (limit to 5)
    const partnersToNotify = partnerIds.slice(0, 5);

    for (const partnerId of partnersToNotify) {
      await notifyPartner(partnerId, leadId, mode);
    }

  } catch (error) {
    console.error('Error routing lead:', error);
  }
}

/**
 * Get matching partners based on routing rules
 */
async function getMatchingPartners(region: string, services: string[]): Promise<string[]> {
  try {
    const { data: rules } = await supabase
      .from('partner_routing_rules')
      .select('partner_ids')
      .eq('active', true)
      .or(`region.eq.${region},region.eq.default`)
      .in('service', services);

    if (!rules || rules.length === 0) {
      // Fallback to default partners
      return ['prime-relocation', 'executive-relocation', 'connectiv-relocation', 'anchor-relocation'];
    }

    // Collect all unique partner IDs, maintaining order preference
    const partnerSet = new Set<string>();
    rules.forEach(rule => {
      rule.partner_ids.forEach((id: string) => partnerSet.add(id));
    });

    return Array.from(partnerSet);

  } catch (error) {
    console.error('Error getting matching partners:', error);
    return ['prime-relocation', 'executive-relocation', 'connectiv-relocation'];
  }
}

/**
 * Notify partner about new lead
 * In production, this would send emails/webhooks
 */
async function notifyPartner(partnerId: string, leadId: string, mode: string) {
  try {
    // In production, implement email notification via SendGrid, Resend, or similar
    // For now, just log
    console.log(`[NOTIFY] Partner ${partnerId} about ${mode} lead ${leadId}`);

    // TODO: Implement email notification
    // - Fetch partner email from relocators table
    // - Send email with lead details
    // - Log notification in notifications table

  } catch (error) {
    console.error('Error notifying partner:', error);
  }
}

/**
 * Extract region from destination string or context
 */
function extractRegion(destination: string, context: any): string {
  const dest = destination.toLowerCase();

  if (context.type === 'region') {
    return context.regionName.toLowerCase();
  }

  if (dest.includes('zurich') || dest.includes('zürich')) return 'zurich';
  if (dest.includes('geneva') || dest.includes('genève')) return 'geneva';
  if (dest.includes('basel')) return 'basel';
  if (dest.includes('zug')) return 'zug';
  if (dest.includes('lausanne')) return 'geneva'; // Western Switzerland
  if (dest.includes('bern')) return 'zurich'; // Central Switzerland

  return 'default';
}

/**
 * Increment KPI counter for today
 */
async function incrementKPI(field: 'matches_count' | 'consultations_booked' | 'quotes_sent') {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Try to update existing record
    const { data: existing } = await supabase
      .from('kpis_daily')
      .select('*')
      .eq('date', today)
      .single();

    if (existing) {
      await supabase
        .from('kpis_daily')
        .update({ [field]: existing[field] + 1 })
        .eq('date', today);
    } else {
      // Insert new record
      await supabase
        .from('kpis_daily')
        .insert({
          date: today,
          [field]: 1,
        });
    }

  } catch (error) {
    console.error('Error incrementing KPI:', error);
  }
}

/**
 * Simple IP hashing for anti-spam
 */
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'relofinder-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}


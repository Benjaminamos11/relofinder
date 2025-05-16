import { supabase } from '../../lib/supabase';

export async function POST({ request }) {
  const headers = { 'Content-Type': 'application/json' };

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers
      });
    }

    // Validate message
    const { message } = body;
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers
      });
    }

    // Get Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers
      });
    }

    // Call Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message.trim() })
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat function error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to get response from chat service',
        details: errorText
      }), {
        status: response.status,
        headers
      });
    }

    // Parse response
    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse chat response:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from chat service' 
      }), {
        status: 500,
        headers
      });
    }

    // Validate response structure
    if (!data?.message) {
      console.error('Invalid response structure:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from chat service' 
      }), {
        status: 500,
        headers
      });
    }

    // Return successful response
    return new Response(JSON.stringify({
      message: data.message
    }), { 
      headers 
    });
  } catch (error) {
    // Handle any other errors
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
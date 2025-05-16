import { supabase } from '../../lib/supabase';

export async function POST({ request }) {
  const headers = { 'Content-Type': 'application/json' };

  try {
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

    const { message } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers
      });
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers
      });
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat function error response:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to get response from chat function',
        details: errorText
      }), {
        status: response.status,
        headers
      });
    }

    let responseData;
    try {
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON response from chat function',
          details: responseText.substring(0, 100) // Log first 100 chars for debugging
        }), {
          status: 500,
          headers
        });
      }
    } catch (error) {
      console.error('Failed to read response:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to read response from chat function' 
      }), {
        status: 500,
        headers
      });
    }

    if (!responseData || !responseData.message) {
      console.error('Invalid response structure:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from chat function' 
      }), {
        status: 500,
        headers
      });
    }

    return new Response(JSON.stringify(responseData), { headers });
  } catch (error) {
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
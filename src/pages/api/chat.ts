import { supabase } from '../../lib/supabase';

export async function POST({ request }) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(`${import.meta.env.SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

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
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Failed to read response:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to read response from chat function' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      console.error('Chat function error:', responseData);
      return new Response(JSON.stringify({ 
        error: responseData.error || 'Failed to get response from chat function' 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!responseData || !responseData.message) {
      console.error('Invalid response structure:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from chat function' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
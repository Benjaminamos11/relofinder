import { Configuration, OpenAIApi } from 'npm:openai@3.3.0'
import { Resend } from 'npm:resend@1.1.0'
import { convert } from 'npm:html-to-text@9.0.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
}

async function sendEmail({ to, subject, content }: EmailRequest) {
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  
  const textContent = convert(content, {
    wordwrap: 130,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' }
    ]
  });

  return await resend.emails.send({
    from: 'ReloFinder Assistant <assistant@relofinder.ch>',
    to,
    subject,
    html: content,
    text: textContent
  });
}

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OpenAI API key not found')
      return new Response(
        JSON.stringify({ 
          error: 'Chat service configuration error',
          details: 'OpenAI API key is not configured'
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Get system prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('name', 'main_chat')
      .single()

    if (promptError || !promptData) {
      console.error('Failed to fetch system prompt:', promptError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize chat service',
          details: 'Could not load system configuration'
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey })
    const openai = new OpenAIApi(configuration)

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: 'The request body could not be parsed as JSON'
        }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // Validate message
    const { message, email } = body
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'Message is required',
          details: 'The message field cannot be empty'
        }),
        { headers: corsHeaders, status: 400 }
      )
    }

    try {
      // Call OpenAI API with retries
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: promptData.content },
              { role: 'user', content: message.trim() }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })

          // Validate response
          const responseMessage = completion.data.choices[0]?.message?.content
          if (!responseMessage) {
            throw new Error('No response content from OpenAI')
          }

          // Return successful response
          let emailResponse = null;
          
          // Check if response contains email request
          if (email && responseMessage.includes('[SEND_EMAIL]')) {
            try {
              const emailContent = responseMessage.replace('[SEND_EMAIL]', '').trim();
              await sendEmail({
                to: email,
                subject: 'Your ReloFinder Chat Summary',
                content: emailContent
              });
              emailResponse = { sent: true };
            } catch (error) {
              console.error('Failed to send email:', error);
              emailResponse = { 
                sent: false, 
                error: 'Failed to send email'
              };
            }
          }
          
          return new Response(
            JSON.stringify({ 
              message: responseMessage.replace('[SEND_EMAIL]', '').trim(),
              email: emailResponse
            }),
            { headers: corsHeaders }
          );
        } catch (error) {
          lastError = error
          
          // Only retry on specific error types
          if (error.response?.status === 429 || // Rate limit
              error.response?.status === 503 || // Service unavailable
              error.code === 'ECONNRESET' ||    // Connection reset
              error.code === 'ETIMEDOUT') {     // Timeout
            attempts++
            if (attempts < maxAttempts) {
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
              continue
            }
          } else {
            // Don't retry on other errors
            break
          }
        }
      }

      // If we get here, all attempts failed
      console.error('OpenAI API error after retries:', lastError)
      
      let errorMessage = 'Failed to generate AI response'
      let errorDetails = ''

      if (lastError.response?.data?.error?.message) {
        errorDetails = lastError.response.data.error.message
      } else if (lastError.message) {
        errorDetails = lastError.message
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorDetails
        }),
        { headers: corsHeaders, status: 500 }
      )
    } catch (error) {
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate AI response',
          details: error.message
        }),
        { headers: corsHeaders, status: 500 }
      )
    }
  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: error.message
      }),
      { headers: corsHeaders, status: 500 }
    )
  }
})
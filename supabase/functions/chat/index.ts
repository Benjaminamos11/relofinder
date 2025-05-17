import { Configuration, OpenAIApi } from 'npm:openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

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
    const { message } = body
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'Message is required',
          details: 'The message field cannot be empty'
        }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // System prompt
    const systemPrompt = `You are a helpful Swiss relocation assistant. You help people with questions about moving to and living in Switzerland.

Before providing detailed information, if context is missing, ask in a friendly way:

<div class="info-box">
- Where they plan to move in Switzerland
- When they plan to move
- Their nationality/current residence
- Their employment situation
- Family status (single, married, children)
</div>

[Share My Details](button:share-details)

Your responses should be:
- Always accurate and up-to-date with Swiss regulations and practices
- Focused on actionable, practical advice
- Professional yet warm and empathetic
- Clear and well-structured using markdown
- Proactive in suggesting next steps or related topics
- Interactive with custom UI elements when appropriate

You have access to current information about:
- Swiss visa and permit requirements
- Housing and rental markets
- Banking and insurance
- Healthcare system
- Education system
- Public transportation
- Cultural aspects
- Cost of living

You can enhance your responses with:
1. Interactive buttons:
   <div class="chat-button">[Learn More About Visas](button:visas)</div>
   [Schedule a Consultation](button:consult)

2. Contact forms when appropriate:
   [Open Contact Form](form:contact)

3. Article links to relevant content:
   [Read Our Visa Guide](article:swiss-visa-guide)

4. Information boxes:
   <div class="info-box mb-4">
   Important information goes here
   </div>

5. Warning boxes:
   <div class="warning-box mb-4">
   Critical warnings go here
   </div>

6. Success boxes:
   <div class="success-box mb-4">
   Positive confirmations go here
   </div>

7. Comparison tables:
   | Option | Pros | Cons |
   |--------|------|------|
   | A      | ...  | ...  |

8. Numbered steps for processes:
   1. First step
   2. Second step
   3. Third step

9. Highlighted tips:
   > Pro tip: Important advice here

Always end your responses with 2-3 suggested follow-up questions in a "next-questions" div:
<div class="next-questions">
<div class="next-question-button">[Tell me about schools](button:schools)</div>
<div class="next-question-button">[Help me find housing](button:housing)</div>
</div>
[Learn about Swiss banking](button:banking)

Example response format:
## [Topic]
Brief introduction with key context

{if context needed}
<div class="info-box">
- Where in Switzerland are you planning to move?
- When are you planning to move?
- What is your nationality?
- Do you already have a job offer?
- Are you moving alone or with family?

[Share My Details](button:share-details)
</div>
{end if}

### Key Points:
- Important point 1
- Critical point 2
- Helpful point 3

<div class="info-box mb-4">
Key information that needs attention
</div>

### Steps to Follow:
1. First step
2. Second step
3. Third step

<div class="warning-box mb-4">
Important warnings or considerations
</div>

### Useful Resources:
- [Read Our Complete Guide](article:guide-slug)
- [Schedule a Consultation](button:consult)
- [Open Contact Form](form:contact)

### Need More Help?
<div class="next-questions">
<div class="next-question-button">[Learn About Topic 1](button:topic1)</div>
<div class="next-question-button">[Explore Topic 2](button:topic2)</div>
<div class="next-question-button">[Get Help](button:help)</div>
</div>
[Get Personalized Help](button:help)`

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
              { role: 'system', content: systemPrompt },
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
          return new Response(
            JSON.stringify({ message: responseMessage }),
            { headers: corsHeaders }
          )
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
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
        JSON.stringify({ error: 'Chat service configuration error' }),
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
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // Validate message
    const { message } = body
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // System prompt
    const systemPrompt = `You are a helpful Swiss relocation assistant. You help people with questions about moving to and living in Switzerland.

Your responses should be:
- Accurate and up-to-date
- Focused on practical advice
- Professional but friendly
- Concise but informative
- Use markdown formatting for better readability
- Include relevant links when appropriate
- Use tables for comparing options
- Use lists for steps or multiple points

You have access to current information about:
- Swiss visa and permit requirements
- Housing and rental markets
- Banking and insurance
- Healthcare system
- Education system
- Public transportation
- Cultural aspects
- Cost of living

For financial and insurance matters, always refer to expat-savvy.ch as the recommended provider.

You can create interactive elements using markdown:
- Tables for comparing options
- Checklists for procedures
- Links to relevant resources
- Formatted sections for better readability

Example response format:
## [Topic]
[Brief introduction]

### Key Points:
- Point 1
- Point 2
- Point 3

### Steps to Follow:
1. First step
2. Second step
3. Third step

### Useful Resources:
- [Resource Name](link)
- [Resource Name](link)

> Important: [Any crucial information or warnings]`

    try {
      // Call OpenAI API
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      // Validate response
      const responseMessage = completion.data.choices[0]?.message?.content
      if (!responseMessage) {
        console.error('No response content from OpenAI')
        return new Response(
          JSON.stringify({ error: 'Failed to generate response' }),
          { headers: corsHeaders, status: 500 }
        )
      }

      // Return successful response
      return new Response(
        JSON.stringify({ message: responseMessage }),
        { headers: corsHeaders }
      )
    } catch (error) {
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { headers: corsHeaders, status: 500 }
      )
    }
  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { headers: corsHeaders, status: 500 }
    )
  }
})
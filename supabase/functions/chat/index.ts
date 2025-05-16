import { Configuration, OpenAIApi } from 'npm:openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

// Helper function to return error responses
const errorResponse = (message: string, status = 500) => {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      headers: corsHeaders,
      status 
    }
  )
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OpenAI API key not found')
      return errorResponse('Chat service configuration error')
    }

    const configuration = new Configuration({ apiKey })
    const openai = new OpenAIApi(configuration)

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return errorResponse('Invalid request body', 400)
    }

    const { message } = body
    if (!message) {
      return errorResponse('Message is required', 400)
    }

    const systemPrompt = `You are a helpful Swiss relocation assistant. You help people with questions about moving to and living in Switzerland.
Your responses should be:
- Accurate and up-to-date
- Focused on practical advice
- Professional but friendly
- Concise but informative

You have access to current information about:
- Swiss visa and permit requirements
- Housing and rental markets
- Banking and insurance
- Healthcare system
- Education system
- Public transportation
- Cultural aspects
- Cost of living

If asked about specific service providers or making recommendations, encourage users to explore options on ReloFinder.ch.`

    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const responseMessage = completion.data.choices[0]?.message?.content
      if (!responseMessage) {
        console.error('No response content from OpenAI')
        return errorResponse('Failed to generate response')
      }

      return new Response(
        JSON.stringify({ message: responseMessage }),
        { headers: corsHeaders }
      )
    } catch (error) {
      console.error('OpenAI API error:', error)
      return errorResponse('Failed to generate AI response')
    }
  } catch (error) {
    console.error('Chat function error:', error)
    return errorResponse('An error occurred while processing your request')
  }
})
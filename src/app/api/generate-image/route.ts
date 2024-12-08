import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    console.log('Starting image generation request')
    
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key missing')
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured',
        success: false 
      }, { status: 500 })
    }
    console.log('API key validated')

    // Parse request
    const { prompt, style } = await request.json()
    console.log('Request parsed:', { prompt, style })

    // Get user session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    console.log('Auth status:', { 
      hasSession: !!session, 
      hasError: !!authError 
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate image
    try {
      console.log('Calling OpenAI API...')
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a black and white line drawing of ${prompt} for a coloring book.
          Use thin, precise black lines for all outlines and details.
          No double lines, no white outlines, no shading.
          Pure white background.
          Style: ${style}.`,
        n: 1,
        size: "1024x1024",
        style: "natural",
        response_format: "url"  // Changed back to URL for simplicity
      })
      console.log('OpenAI response received')

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL in response')
      }

      // Save to database
      console.log('Saving to database...')
      const { error: dbError } = await supabase
        .from('images')
        .insert({
          user_id: session.user.id,
          prompt,
          storage_path: response.data[0].url,
          parameters: { style }
        })
      console.log('Database save complete', { hasError: !!dbError })

      return NextResponse.json({ 
        output: [response.data[0].url],
        success: true 
      })

    } catch (openaiError) {
      console.error('OpenAI API Error:', {
        message: openaiError.message,
        status: openaiError.status,
        details: openaiError.response?.data
      })
      throw openaiError
    }

  } catch (error) {
    console.error('Request processing error:', {
      message: error.message,
      stack: error.stack
    })
    throw error
  }
} 
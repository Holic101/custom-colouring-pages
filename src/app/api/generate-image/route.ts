import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured',
        success: false 
      }, { status: 500 })
    }

    const enhancedPrompt = `Create a black and white line drawing of ${prompt} for a coloring book.
      Use thin, precise black lines for all outlines and details.
      No double lines, no white outlines, no shading.
      Pure white background.
      Style: ${style}.`

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        style: "natural",
        response_format: "url"
      })

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL in response')
      }

      return NextResponse.json({ 
        output: [response.data[0].url],
        success: true 
      })

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError)
      return NextResponse.json({ 
        error: 'OpenAI API request failed',
        details: openaiError instanceof Error ? openaiError.message : 'Unknown error',
        success: false 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 400 })
  }
} 
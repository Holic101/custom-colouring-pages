import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, style, settings } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured',
        success: false 
      }, { status: 500 })
    }

    // Add more specific prompt engineering
    const enhancedPrompt = `Create a black and white line art suitable for a coloring page in ${style} style of: ${prompt}. 
      The image should have clear, well-defined lines and no shading or coloring. 
      Make it ${settings?.complexity || 'Medium'} complexity with ${settings?.detailLevel || 'Medium'} detail level.`

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
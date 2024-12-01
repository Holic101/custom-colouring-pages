import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI()

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    console.log('Generating image for prompt:', prompt)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a black and white line art suitable for a coloring page of: ${prompt}. The image should have clear, well-defined lines and no shading or coloring.`,
      n: 1,
      size: "1024x1024",
      style: "natural"
    })

    console.log('OpenAI response:', response)

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in response')
    }

    return NextResponse.json({ 
      output: [response.data[0].url],
      success: true 
    })
  } catch (error) {
    console.error('Error in generate-image:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate image',
      success: false 
    }, { status: 500 })
  }
} 
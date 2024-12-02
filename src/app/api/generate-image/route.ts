import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const enhancedPrompt = `Create a black and white line drawing of ${prompt} for a coloring book.
      Use thin, precise black lines for all outlines and details.
      No double lines, no white outlines, no shading.
      Pure white background.
      Style: ${style}.`

    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      style: "natural",
      response_format: "b64_json"  // Changed to get base64
    })

    if (!response.data?.[0]?.b64_json) {
      throw new Error('No image data in response')
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(response.data[0].b64_json, 'base64')
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(fileName)

    // Save reference to database
    const { error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: session.user.id,
        prompt,
        storage_path: publicUrl,
        parameters: { style }
      })

    if (dbError) throw dbError

    return NextResponse.json({ 
      output: [publicUrl],
      success: true 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 })
  }
} 
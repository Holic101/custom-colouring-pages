import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured',
        success: false 
      }, { status: 500 })
    }

    const { prompt, style } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enhancedPrompt = `Create a black and white line drawing of ${prompt} for a coloring book.
      Use thin, precise black lines for all outlines and details.
      No double lines, no white outlines, no shading.
      Pure white background.
      Style: ${style}.`

    // Generate image with DALL-E
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        style: "natural",
        response_format: "b64_json"
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

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('Failed to upload image to storage')
      }

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

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save image reference')
      }

      return NextResponse.json({ 
        output: [publicUrl],
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
    }, { status: 500 })
  }
} 
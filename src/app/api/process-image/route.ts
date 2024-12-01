import { NextResponse } from 'next/server'
import sharp from 'sharp'

interface ProcessImageParams {
  imageUrl: string
  settings: {
    lineThickness: number
    edgeSoftness: number
    removeBackground: boolean
    symmetry: 'None' | 'Horizontal' | 'Vertical' | 'Both'
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl, settings }: ProcessImageParams = await request.json()

    // Fetch the image
    const response = await fetch(imageUrl)
    const imageBuffer = await response.arrayBuffer()

    // Start processing pipeline
    let processedImage = sharp(Buffer.from(imageBuffer))

    // 1. Convert to grayscale and increase contrast
    processedImage = processedImage
      .grayscale()
      .normalize()
      .linear(1.5, -(settings.edgeSoftness / 100) * 128) // Adjust contrast based on edge softness

    // 2. Edge detection and enhancement
    processedImage = processedImage
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
        scale: 1 + settings.lineThickness / 2,
      })

    // 3. Convert to high-contrast black and white
    processedImage = processedImage
      .threshold(128)
      .negate() // Make lines black on white background

    // 4. Line smoothing using slight blur and re-threshold
    processedImage = processedImage
      .blur(0.5)
      .threshold(128)

    // 5. Background cleanup if enabled
    if (settings.removeBackground) {
      processedImage = processedImage
        .flatten({ background: '#ffffff' })
    }

    // 6. Apply symmetry if requested
    if (settings.symmetry !== 'None') {
      const metadata = await processedImage.metadata()
      const width = metadata.width || 1024
      const height = metadata.height || 1024

      if (settings.symmetry === 'Horizontal' || settings.symmetry === 'Both') {
        const half = Math.floor(width / 2)
        processedImage = processedImage
          .extract({ left: 0, top: 0, width: half, height })
          .extend({
            right: half,
            background: '#ffffff',
          })
          .flop()
      }

      if (settings.symmetry === 'Vertical' || settings.symmetry === 'Both') {
        const half = Math.floor(height / 2)
        processedImage = processedImage
          .extract({ left: 0, top: 0, width: width, height: half })
          .extend({
            bottom: half,
            background: '#ffffff',
          })
          .flip()
      }
    }

    // Convert to PNG buffer
    const outputBuffer = await processedImage
      .png()
      .toBuffer()

    // Return processed image as base64
    const base64Image = `data:image/png;base64,${outputBuffer.toString('base64')}`

    return NextResponse.json({ 
      success: true,
      processedImage: base64Image
    })

  } catch (error) {
    console.error('Image processing failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Image processing failed'
    }, { status: 500 })
  }
} 
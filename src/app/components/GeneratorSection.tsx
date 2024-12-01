'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function GeneratorSection() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent form submission
    if (!prompt.trim() || !user) return
    
    console.log('Starting generation...', { userId: user.id, prompt })
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      // Test loading state
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 1. Generate image with DALL-E
      console.log('Sending request to API...')
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (data.error) throw new Error(data.error)
      if (!data.output?.[0]) throw new Error('No image generated')

      const imageUrl = data.output[0]
      console.log('Image URL:', imageUrl)

      // Test if the image URL is accessible
      try {
        const imgResponse = await fetch(imageUrl)
        if (!imgResponse.ok) {
          throw new Error(`Image URL not accessible: ${imgResponse.status}`)
        }
      } catch (imgError) {
        console.error('Image URL test failed:', imgError)
      }

      setGeneratedImage(imageUrl)
      console.log('Set generated image to:', imageUrl)

      // 2. Save to Supabase
      console.log('Saving to Supabase...', {
        user_id: user.id,
        prompt,
        storage_path: imageUrl
      })

      const { data: insertedData, error: supabaseError } = await supabase
        .from('images')
        .insert({
          user_id: user.id,
          prompt,
          storage_path: imageUrl,
          parameters: { model: 'dall-e-3' }
        })
        .select()
        .single()

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw supabaseError
      }

      console.log('Successfully saved to Supabase:', insertedData)
      router.refresh()

    } catch (error) {
      console.error('Generation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
      console.log('Final state:', { isGenerating: false, generatedImage, error })
    }
  }

  const renderImage = () => {
    if (!generatedImage) return null;
    
    console.log('Rendering image with URL:', generatedImage);
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="relative aspect-square w-full bg-gray-50">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Loading image...
          </div>
          <Image
            src={generatedImage}
            alt={prompt}
            fill
            className="object-contain z-10"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              console.error('Image failed to load:', e);
              setError('Failed to load the generated image');
            }}
          />
        </div>
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">{prompt}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Generate Coloring Page</h2>
      
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Describe your coloring page
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cute cat playing with yarn"
            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim() || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {isGenerating && (
          <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Creating your coloring page...</p>
          </div>
        )}

        {generatedImage && renderImage()}
      </form>
    </div>
  )
} 
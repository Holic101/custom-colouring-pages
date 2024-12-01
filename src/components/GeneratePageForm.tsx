'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function GeneratePageForm() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call your image generation API
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const { output } = await response.json()

      // Save to Supabase
      const { data, error } = await supabase
        .from('images')
        .insert({
          prompt,
          storage_path: output[0], // Assuming output is the image URL
          parameters: { model: 'dall-e-3' }
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/gallery/${data.id}`)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Spiderman on a bike"
          className="flex-1 p-4 rounded-l-full rounded-r-none border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !prompt}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-r-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate
        </button>
      </div>
    </form>
  )
} 
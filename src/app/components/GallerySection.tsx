'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

type Image = {
  id: string
  prompt: string
  storage_path: string
  created_at: string
}

export function GallerySection() {
  const { user } = useAuth()
  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadImages = async () => {
      if (!user) {
        setImages([])
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setImages(data || [])
      } catch (error) {
        console.error('Failed to load images:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [user, supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Your Gallery</h2>
      
      {!user ? (
        <p className="text-gray-600">Please sign in to view your gallery</p>
      ) : images.length === 0 ? (
        <p className="text-gray-600">No images generated yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="aspect-square bg-gray-100 rounded-lg">
              {/* TODO: Implement image display */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
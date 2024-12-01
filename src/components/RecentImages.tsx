'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/AuthContext'

type ImageType = {
  id: string
  prompt: string
  storage_path: string
  created_at: string
}

export default function RecentImages() {
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function loadImages() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        setImages(data || [])
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [user, supabase])

  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!images.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          No images yet. Try generating your first coloring page!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image) => (
        <div 
          key={image.id} 
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 group cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => handleImageClick(image.storage_path)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleImageClick(image.storage_path)
            }
          }}
        >
          <div className="relative aspect-square">
            <Image
              src={image.storage_path}
              alt={image.prompt}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity duration-200"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Click to open
              </span>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 truncate" title={image.prompt}>
              {image.prompt}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(image.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 
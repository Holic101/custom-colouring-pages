'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Heart, X } from 'lucide-react'

interface ImageType {
  id: string
  prompt: string
  storage_path: string
  created_at: string
  is_favorite: boolean
}

export default function RecentImages() {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageType[]>([])
  const supabase = createClient()

  const handleDelete = async (image: ImageType) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id)

      if (error) throw error
      setImages(images.filter(img => img.id !== image.id))
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleToggleFavorite = async (image: ImageType) => {
    try {
      const { error } = await supabase
        .from('images')
        .update({ is_favorite: !image.is_favorite })
        .eq('id', image.id)

      if (error) throw error
      setImages(images.map(img => 
        img.id === image.id ? { ...img, is_favorite: !img.is_favorite } : img
      ))
    } catch (error) {
      console.error('Error updating favorite:', error)
    }
  }

  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  useEffect(() => {
    const loadImages = async () => {
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
      }
    }

    loadImages()
  }, [user, supabase])

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleToggleFavorite(image)}
              className={`p-2 rounded-full ${
                image.is_favorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              } hover:bg-opacity-90`}
            >
              <Heart className={`w-5 h-5 ${image.is_favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => handleDelete(image)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div 
            className="relative aspect-square cursor-pointer"
            onClick={() => handleImageClick(image.storage_path)}
          >
            <Image
              src={image.storage_path}
              alt={image.prompt}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      ))}
    </div>
  )
} 
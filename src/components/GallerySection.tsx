'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Search, Heart, X, Printer } from 'lucide-react'

interface ImageType {
  id: string
  prompt: string
  storage_path: string
  created_at: string
  is_favorite: boolean
}

export function GallerySection() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [images, setImages] = useState<ImageType[]>([])
  const supabase = createClient()

  useEffect(() => {
    const loadImages = async () => {
      if (!user) return
      
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
      }
    }

    loadImages()
  }, [user, supabase])

  // Filter images based on search and favorites
  const filteredImages = images.filter(image => {
    const matchesSearch = image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFavorites = showFavorites ? image.is_favorite : true
    return matchesSearch && matchesFavorites
  })

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
        img.id === image.id ? { ...img, is_favorite: !image.is_favorite } : img
      ))
    } catch (error) {
      console.error('Error updating favorite:', error)
    }
  }

  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  const handlePrint = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation()
    const printWindow = window.open(imageUrl)
    printWindow?.addEventListener('load', () => {
      printWindow.print()
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              showFavorites 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="relative group">
            <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFavorite(image)
                }}
                className={`p-2 rounded-full ${
                  image.is_favorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-90`}
              >
                <Heart className={`w-5 h-5 ${image.is_favorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => handlePrint(e, image.storage_path)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(image)
                }}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div 
              className="relative aspect-square cursor-pointer bg-white rounded-lg overflow-hidden"
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
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">{image.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
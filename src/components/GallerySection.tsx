'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Heart } from 'lucide-react'
import TagInput from './TagInput'
import GalleryFilters from './GalleryFilters'

type ImageType = {
  id: string
  prompt: string
  storage_path: string
  created_at: string
  is_favorite: boolean
  tags: string[]
}

export function GallerySection() {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const supabase = createClient()

  // Load images and tags
  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        // Load images with tags
        const { data: imagesData, error: imagesError } = await supabase
          .from('images')
          .select(`
            *,
            image_tags (
              tags (name)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (imagesError) throw imagesError

        // Transform the data to include tags array
        const processedImages = imagesData.map(img => ({
          ...img,
          tags: img.image_tags?.map((it: any) => it.tags.name) || []
        }))

        setImages(processedImages)

        // Load all available tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('name')

        if (tagsError) throw tagsError
        setAvailableTags(tagsData.map(t => t.name))

      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  const toggleFavorite = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId)
      if (!image) return

      const { error } = await supabase
        .from('images')
        .update({ is_favorite: !image.is_favorite })
        .eq('id', imageId)

      if (error) throw error

      setImages(images.map(img =>
        img.id === imageId ? { ...img, is_favorite: !img.is_favorite } : img
      ))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const addTag = async (imageId: string, tag: string) => {
    try {
      // First, ensure the tag exists
      const { data: existingTag, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tag)
        .single()

      let tagId
      if (tagError) {
        // Create new tag
        const { data: newTag, error: createError } = await supabase
          .from('tags')
          .insert({ name: tag })
          .select('id')
          .single()

        if (createError) throw createError
        tagId = newTag.id
      } else {
        tagId = existingTag.id
      }

      // Add tag to image
      const { error: linkError } = await supabase
        .from('image_tags')
        .insert({ image_id: imageId, tag_id: tagId })

      if (linkError) throw linkError

      // Update local state
      setImages(images.map(img =>
        img.id === imageId ? { ...img, tags: [...img.tags, tag] } : img
      ))

      if (!availableTags.includes(tag)) {
        setAvailableTags([...availableTags, tag])
      }
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  const removeTag = async (imageId: string, tag: string) => {
    try {
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tag)
        .single()

      if (tagError) throw tagError

      const { error } = await supabase
        .from('image_tags')
        .delete()
        .eq('image_id', imageId)
        .eq('tag_id', tagData.id)

      if (error) throw error

      setImages(images.map(img =>
        img.id === imageId ? { ...img, tags: img.tags.filter(t => t !== tag) } : img
      ))
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const filteredImages = images.filter(image => {
    if (showFavorites && !image.is_favorite) return false
    if (selectedTags.length === 0) return true
    return selectedTags.every(tag => image.tags.includes(tag))
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <GalleryFilters
        selectedTags={selectedTags}
        availableTags={availableTags}
        showFavorites={showFavorites}
        onTagSelect={(tag) => {
          setSelectedTags(prev =>
            prev.includes(tag)
              ? prev.filter(t => t !== tag)
              : [...prev, tag]
          )
        }}
        onToggleFavorites={() => setShowFavorites(!showFavorites)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <div 
            key={image.id} 
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
          >
            <div className="relative aspect-square">
              <Image
                src={image.storage_path}
                alt={image.prompt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <button
                onClick={() => toggleFavorite(image.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm"
              >
                <Heart 
                  className={`w-5 h-5 ${
                    image.is_favorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-900 mb-2">{image.prompt}</p>
              <TagInput
                tags={image.tags}
                onAddTag={(tag) => addTag(image.id, tag)}
                onRemoveTag={(tag) => removeTag(image.id, tag)}
                suggestions={availableTags}
              />
              <p className="text-xs text-gray-500 mt-2">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
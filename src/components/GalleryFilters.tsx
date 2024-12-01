'use client'

import { Heart, Filter } from 'lucide-react'

interface GalleryFiltersProps {
  selectedTags: string[]
  availableTags: string[]
  showFavorites: boolean
  onTagSelect: (tag: string) => void
  onToggleFavorites: () => void
}

export default function GalleryFilters({
  selectedTags,
  availableTags,
  showFavorites,
  onTagSelect,
  onToggleFavorites,
}: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTags.includes(tag)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <button
        onClick={onToggleFavorites}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
          showFavorites
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
        Favorites
      </button>
    </div>
  )
} 
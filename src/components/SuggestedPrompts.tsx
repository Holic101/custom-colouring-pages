'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { StylePreset } from './GeneratorSection'

const SUGGESTED_PROMPTS = [
  { text: "A magical forest with fairy houses", style: "Cartoon" as StylePreset },
  { text: "A friendly dragon reading a book", style: "Manga" as StylePreset },
  { text: "A peaceful garden with butterflies", style: "Realistic" as StylePreset },
  { text: "An underwater city with mermaids", style: "Cartoon" as StylePreset },
  { text: "A space station with robots", style: "Manga" as StylePreset },
  { text: "A cozy treehouse in autumn", style: "Realistic" as StylePreset },
]

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string, style: StylePreset) => void
}

export default function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextPrompt = () => {
    setCurrentIndex((prev) => (prev + 1) % SUGGESTED_PROMPTS.length)
  }

  const previousPrompt = () => {
    setCurrentIndex((prev) => (prev - 1 + SUGGESTED_PROMPTS.length) % SUGGESTED_PROMPTS.length)
  }

  return (
    <div className="relative bg-gray-50 rounded-lg p-4">
      <div className="flex items-center">
        <button
          onClick={previousPrompt}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Previous prompt"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div 
          className="flex-1 mx-4 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onSelectPrompt(
            SUGGESTED_PROMPTS[currentIndex].text,
            SUGGESTED_PROMPTS[currentIndex].style
          )}
        >
          <p className="text-sm font-medium text-center">
            {SUGGESTED_PROMPTS[currentIndex].text}
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Style: {SUGGESTED_PROMPTS[currentIndex].style}
          </p>
        </div>

        <button
          onClick={nextPrompt}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Next prompt"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SuggestedPrompts from './SuggestedPrompts'
import { Clock, Sparkles } from 'lucide-react'
import AdvancedControls, { AdvancedSettings } from './AdvancedControls'

export const STYLE_PRESETS = ['Cartoon', 'Realistic', 'Manga'] as const
export type StylePreset = typeof STYLE_PRESETS[number]

const MAX_PROMPT_LENGTH = 500
const DRAFT_SAVE_DELAY = 1000 // 1 second

interface PromptHistory {
  text: string
  style: StylePreset
  timestamp: number
}

export function GeneratorSection() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>('Cartoon')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    lineThickness: 3,
    complexity: 'Medium',
    canvasSize: 'A4',
    orientation: 'Portrait',
    detailLevel: 'Medium',
    edgeSoftness: 50,
    removeBackground: false,
    symmetry: 'None',
  })

  // Load prompt history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('promptHistory')
    if (savedHistory) {
      setPromptHistory(JSON.parse(savedHistory))
    }

    // Load draft prompt
    const draftPrompt = localStorage.getItem('draftPrompt')
    if (draftPrompt) {
      setPrompt(draftPrompt)
    }
  }, [])

  // Auto-save draft prompt
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('draftPrompt', prompt)
    }, DRAFT_SAVE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [prompt])

  const handlePromptChange = (value: string) => {
    if (value.length <= MAX_PROMPT_LENGTH) {
      setPrompt(value)
    }
  }

  const saveToHistory = (text: string, style: StylePreset) => {
    const newHistory = [
      { text, style, timestamp: Date.now() },
      ...promptHistory.slice(0, 9), // Keep only last 10 prompts
    ]
    setPromptHistory(newHistory)
    localStorage.setItem('promptHistory', JSON.stringify(newHistory))
  }

  const handleStyleSelect = (style: StylePreset) => {
    setSelectedStyle(style)
  }

  const handleSuggestedPrompt = (text: string, style: StylePreset) => {
    setPrompt(text)
    setSelectedStyle(style as StylePreset)
  }

  const handleHistorySelect = (historyItem: PromptHistory) => {
    setPrompt(historyItem.text)
    setSelectedStyle(historyItem.style)
    setShowHistory(false)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || !user) return
    
    console.log('Starting generation...', { 
      userId: user.id, 
      prompt,
      style: selectedStyle,
      settings: advancedSettings
    })
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      // 1. Generate initial image with DALL-E
      console.log('Generating initial image...')
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          style: selectedStyle,
          settings: advancedSettings
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      if (!data.output?.[0]) throw new Error('No image generated')

      const initialImageUrl = data.output[0]

      // 2. Process the image
      console.log('Processing image...')
      const processResponse = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: initialImageUrl,
          settings: {
            lineThickness: advancedSettings.lineThickness,
            edgeSoftness: advancedSettings.edgeSoftness,
            removeBackground: advancedSettings.removeBackground,
            symmetry: advancedSettings.symmetry,
          }
        })
      })

      if (!processResponse.ok) {
        throw new Error('Image processing failed')
      }

      const processedData = await processResponse.json()
      if (!processedData.success) {
        throw new Error(processedData.error || 'Processing failed')
      }

      // 3. Set the processed image
      setGeneratedImage(processedData.processedImage)

      // 4. Save to Supabase
      console.log('Saving to Supabase...')
      const { data: insertedData, error: supabaseError } = await supabase
        .from('images')
        .insert({
          user_id: user.id,
          prompt,
          storage_path: processedData.processedImage, // Save the processed image
          parameters: { 
            model: 'dall-e-3',
            style: selectedStyle,
            ...advancedSettings
          }
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
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Suggested Prompts */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Need inspiration?</h3>
          <SuggestedPrompts onSelectPrompt={handleSuggestedPrompt} />
        </div>

        {/* Style Presets */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Style
          </label>
          <div className="flex gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => handleStyleSelect(style)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedStyle === style
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
              Describe your coloring page
            </label>
            <span className="text-xs text-gray-500">
              {prompt.length}/{MAX_PROMPT_LENGTH}
            </span>
          </div>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="e.g., A cute cat playing with yarn"
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="absolute right-2 bottom-2 p-2 text-gray-500 hover:text-gray-700"
              title="Show prompt history"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prompt History Popup */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Prompt History</h3>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2">
                {promptHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistorySelect(item)}
                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Style: {item.style} • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Advanced Controls before the Generate button */}
        <AdvancedControls
          settings={advancedSettings}
          onChange={setAdvancedSettings}
        />

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim() || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
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
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Error and Loading States */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Generated Image Display */}
        {generatedImage && (
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
        )}
      </form>
    </div>
  )
} 
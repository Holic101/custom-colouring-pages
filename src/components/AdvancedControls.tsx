'use client'

import { Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export interface AdvancedSettings {
  lineThickness: number
  complexity: 'Simple' | 'Medium' | 'Complex'
  canvasSize: 'A4' | 'A5' | 'Letter' | 'Custom'
  orientation: 'Portrait' | 'Landscape'
  detailLevel: 'Low' | 'Medium' | 'High'
  edgeSoftness: number
  removeBackground: boolean
  symmetry: 'None' | 'Horizontal' | 'Vertical' | 'Both'
  customWidth?: number
  customHeight?: number
}

interface AdvancedControlsProps {
  settings: AdvancedSettings
  onChange: (settings: AdvancedSettings) => void
}

export default function AdvancedControls({ settings, onChange }: AdvancedControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateSettings = (updates: Partial<AdvancedSettings>) => {
    onChange({ ...settings, ...updates })
  }

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Advanced Controls
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 border-t space-y-6">
          {/* Line Thickness */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Line Thickness ({settings.lineThickness})
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.lineThickness}
              onChange={(e) => updateSettings({ lineThickness: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Complexity Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Complexity Level
            </label>
            <div className="flex gap-2">
              {['Simple', 'Medium', 'Complex'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateSettings({ complexity: level as AdvancedSettings['complexity'] })}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    settings.complexity === level
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Canvas Size
            </label>
            <div className="flex flex-wrap gap-2">
              {['A4', 'A5', 'Letter', 'Custom'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateSettings({ canvasSize: size as AdvancedSettings['canvasSize'] })}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    settings.canvasSize === size
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {settings.canvasSize === 'Custom' && (
              <div className="flex gap-4 mt-2">
                <div>
                  <label className="block text-xs text-gray-600">Width (px)</label>
                  <input
                    type="number"
                    value={settings.customWidth}
                    onChange={(e) => updateSettings({ customWidth: Number(e.target.value) })}
                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Height (px)</label>
                  <input
                    type="number"
                    value={settings.customHeight}
                    onChange={(e) => updateSettings({ customHeight: Number(e.target.value) })}
                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Orientation
            </label>
            <div className="flex gap-2">
              {['Portrait', 'Landscape'].map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  onClick={() => updateSettings({ orientation: orientation as AdvancedSettings['orientation'] })}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    settings.orientation === orientation
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {orientation}
                </button>
              ))}
            </div>
          </div>

          {/* Detail Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Detail Level
            </label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateSettings({ detailLevel: level as AdvancedSettings['detailLevel'] })}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    settings.detailLevel === level
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Edge Softness */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Edge Softness ({settings.edgeSoftness}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.edgeSoftness}
              onChange={(e) => updateSettings({ edgeSoftness: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Background Removal */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="removeBackground"
              checked={settings.removeBackground}
              onChange={(e) => updateSettings({ removeBackground: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="removeBackground" className="ml-2 block text-sm text-gray-700">
              Remove Background
            </label>
          </div>

          {/* Symmetry Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Symmetry
            </label>
            <div className="flex flex-wrap gap-2">
              {['None', 'Horizontal', 'Vertical', 'Both'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateSettings({ symmetry: option as AdvancedSettings['symmetry'] })}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    settings.symmetry === option
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
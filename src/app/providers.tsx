'use client'

import { createContext } from 'react'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 
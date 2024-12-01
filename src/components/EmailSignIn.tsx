'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function EmailSignIn() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signInWithEmail, signUpWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isRegister) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" required />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" required />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isRegister ? 'Register' : 'Sign In'}</button>
      <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full text-sm text-blue-600 hover:text-blue-800">{isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}</button>
    </form>
  )
} 
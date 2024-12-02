import SignInWithGoogle from '@/components/SignInWithGoogle'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
          Bilder zum Ausmalen
        </h1>
        <div className="flex justify-center">
          <SignInWithGoogle />
        </div>
      </div>
    </main>
  )
} 
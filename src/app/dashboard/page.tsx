import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { GeneratorSection } from '@/components/GeneratorSection'
import RecentImages from '@/components/RecentImages'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Generator */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Create Coloring Page</h1>
            <GeneratorSection />
          </div>

          {/* Right Column: Recent Images */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Images</h2>
            <RecentImages />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 
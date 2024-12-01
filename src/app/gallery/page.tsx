import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import DashboardLayout from '@/components/DashboardLayout'
import Image from 'next/image'

export default async function GalleryPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: images } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">Your Gallery</h1>
        
        {!images?.length ? (
          <p className="text-gray-600">No images generated yet. Try generating some coloring pages!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.storage_path}
                    alt={image.prompt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-gray-900">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
} 
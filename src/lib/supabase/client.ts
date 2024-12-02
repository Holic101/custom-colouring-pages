import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const isDevelopment = process.env.NODE_ENV === 'development'
const siteUrl = isDevelopment 
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_SITE_URL

export function createClient() {
  return createClientComponentClient<Database>({
    cookieOptions: {
      name: 'sb-auth-token',
      domain: isDevelopment ? 'localhost' : undefined,
      secure: !isDevelopment,
      sameSite: 'lax',
      path: '/'
    }
  })
} 
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Palette, Image as ImageIcon, LogOut } from 'lucide-react'

const navigation = [
  { name: 'Create', href: '/dashboard', icon: Palette },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex items-center">
                <Palette className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">Ausmalbilder</span>
              </div>
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        inline-flex items-center px-3 py-2 text-sm font-medium
                        ${pathname === item.href
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 mr-1.5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center">
              {user && (
                <>
                  <span className="text-sm text-gray-500 mr-4">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 
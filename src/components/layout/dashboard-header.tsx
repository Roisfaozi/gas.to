'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Link as LinkIcon, Settings } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <LinkIcon className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">ShortLink</span>
            </Link>
            <nav className="ml-8 flex space-x-4">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/links"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Links
              </Link>
              <Link
                href="/dashboard/bio"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Bio Page
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/profile"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
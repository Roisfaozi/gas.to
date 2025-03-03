'use client'
import { deleteBioPage } from '@/app/actions/bio'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatEpochRelative } from '@/lib/utils'
import { BarChart, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface BioPage {
  id: string
  title: string
  username: string
  created_at: number
  clicks: Array<{ count: number }>
}

export function BioPageGrid({ bioPages }: { bioPages: BioPage[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const filteredPages = bioPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bio page?')) {
      await deleteBioPage(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search bio pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <div key={page.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {page.title.charAt(0)}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/bio/${page.id}/stats`)}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Statistics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/bio/${page.id}/edit`)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(page.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                <a
                  href={`/bio/${page.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  {`${process.env.NEXT_PUBLIC_APP_URL}/bio/${page.username}`}
                </a>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {page.clicks?.[0]?.count || 0} views
                </div>
                <div>
                  Created {formatEpochRelative(page.created_at)} ago
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
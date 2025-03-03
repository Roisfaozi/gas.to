'use client'

import { formatEpochRelative } from '@/lib/utils'
import { Copy, MoreVertical } from 'lucide-react'
import { useState } from 'react'
interface RecentLink {
  id: string
  type: 'bio' | 'shortlink'
  status: 'online' | 'disabled'
  visibility: 'public' | 'private'
  title: string
  url: string
  created_at: number
}

interface RecentLinksProps {
  links: RecentLink[]
}

export function RecentLinks({ links }: RecentLinksProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(process.env.NEXT_PUBLIC_APP_URL + url)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Links</h2>
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for links"
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
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredLinks.map((link) => (
          <div key={link.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{link.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${link.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {link.status}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {link.visibility}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {link.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(link.url)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                {`${process.env.NEXT_PUBLIC_APP_URL}${link.url}`}
              </a>
              <p className="text-xs text-gray-500 mt-1">
                Created {formatEpochRelative(link.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
'use client'

import { supabase } from '@/lib/supabase/client'
import { formatEpochDate } from '@/lib/utils'
import { Copy, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
export function LinkList({ links }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const copyToClipboard = async (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`
    await navigator.clipboard.writeText(url)
  }

  const deleteLink = async (id: string) => {
    try {
      setDeletingId(id)
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting link:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No links created yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Short Link
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Original URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {links.map((link) => (
            <tr key={link.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {link.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <a
                    href={`/${link.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    {link.short_code}
                  </a>
                  <button
                    onClick={() => copyToClipboard(link.short_code)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 truncate max-w-xs">
                    {link.original_url}
                  </span>
                  <a
                    href={link.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {formatEpochDate(link.created_at, 'PP')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => deleteLink(link.id)}
                  disabled={deletingId === link.id}
                  className="text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
'use client'

import { supabase } from '@/lib/supabase/client'
import { generateShortCode, isValidUrl } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const linkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  title: z.string().min(1, 'Title is required'),
})

type LinkFormData = z.infer<typeof linkSchema>

export function CreateLinkDialog({ open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  })

  const onSubmit = async (data: LinkFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!isValidUrl(data.originalUrl)) {
        throw new Error('Invalid URL')
      }

      const shortCode = generateShortCode()
      const { data: session } = await supabase.auth.getSession()

      if (!session?.session?.user) {
        throw new Error('Not authenticated')
      }

      const { error: createError } = await supabase
        .from('links')
        .insert([
          {
            short_code: shortCode,
            original_url: data.originalUrl,
            title: data.title,
            user_id: session.session.user.id,
          },
        ])

      if (createError) throw createError

      reset()
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Link</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Original URL
            </label>
            <input
              {...register('originalUrl')}
              type="url"
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.originalUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.originalUrl.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="My Link"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
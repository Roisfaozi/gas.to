'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createSingleLink, createMultipleLinks } from '@/app/actions/links'

export function CreateLinkForms() {
  const [singleLinkError, setSingleLinkError] = useState<string | null>(null)
  const [multipleLinkError, setMultipleLinkError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSingleLink(formData: FormData) {
    try {
      setIsSubmitting(true)
      setSingleLinkError(null)
      setSuccess(null)

      const result = await createSingleLink(formData)
      if (result.error) {
        setSingleLinkError(result.error)
      } else {
        setSuccess(`Short link created successfully!`)
        // Reset form
        const form = document.getElementById('single-link-form') as HTMLFormElement
        form?.reset()
      }
    } catch (error: any) {
      setSingleLinkError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleMultipleLinks(formData: FormData) {
    try {
      setIsSubmitting(true)
      setMultipleLinkError(null)
      setSuccess(null)

      const result = await createMultipleLinks(formData)
      if (result.error) {
        setMultipleLinkError(result.error)
      } else {
        setSuccess(`${result.count} short links created successfully!`)
        // Reset form
        const form = document.getElementById('multiple-links-form') as HTMLFormElement
        form?.reset()
      }
    } catch (error: any) {
      setMultipleLinkError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Short Links</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
          {success}
        </div>
      )}

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="single">Single Link</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Links</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <form id="single-link-form" action={handleSingleLink} className="space-y-4">
            {singleLinkError && (
              <div className="p-3 bg-red-50 text-red-700 rounded">
                {singleLinkError}
              </div>
            )}

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                placeholder="https://example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title (optional)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="My Link"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Short Link'}
            </button>
          </form>
        </TabsContent>

        <TabsContent value="multiple">
          <form id="multiple-links-form" action={handleMultipleLinks} className="space-y-4">
            {multipleLinkError && (
              <div className="p-3 bg-red-50 text-red-700 rounded">
                {multipleLinkError}
              </div>
            )}

            <div>
              <label htmlFor="urls" className="block text-sm font-medium text-gray-700">
                URLs (one per line)
              </label>
              <textarea
                id="urls"
                name="urls"
                required
                rows={5}
                placeholder="https://example.com&#10;https://another-example.com&#10;https://yet-another-example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Short Links'}
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
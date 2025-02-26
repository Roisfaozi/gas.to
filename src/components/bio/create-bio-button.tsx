'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateBioDialog } from './create-bio-dialog'

export function CreateBioButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Bio
      </button>
      <CreateBioDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
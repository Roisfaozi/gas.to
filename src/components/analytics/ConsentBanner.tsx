'use client'

import { captureGeolocation } from '@/lib/analytics/session'
import { useEffect, useState } from 'react'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Check if consent has already been given
    const hasConsent = localStorage.getItem('consent_given') === 'true'

    if (!hasConsent) {
      setShowBanner(true)
    }

    // Get session ID from localStorage or other source
    const sid = localStorage.getItem('session_id')
    if (sid) {
      setSessionId(sid)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('consent_given', 'true')
    setShowBanner(false)

    // Enable geolocation tracking if session exists
    if (sessionId) {
      captureGeolocation(sessionId, true)
    }
  }

  const handleDecline = () => {
    localStorage.setItem('consent_given', 'false')
    setShowBanner(false)

    // Disable geolocation tracking
    if (sessionId) {
      captureGeolocation(sessionId, false)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <p className="text-sm">
            We use cookies and similar technologies to enhance your experience, analyze traffic, and for marketing purposes.
            We also collect location data to provide better services. By clicking "Accept", you consent to our use of these technologies.
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
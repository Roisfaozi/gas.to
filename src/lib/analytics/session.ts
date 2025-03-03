import { supabase } from '@/lib/supabase/client'
import { getCurrentEpoch } from '@/lib/utils'
import { generateFingerprint } from './fingerprint'
import { requestGeolocation, reverseGeocode } from './geolocation'

interface SessionData {
  sessionId: string
  visitorId: string
  fingerprint: string
  isReturning: boolean
}

// Store the current session data
let currentSession: SessionData | null = null

/**
 * Initialize a visitor session
 * This should be called when the application loads
 */
export async function initSession(): Promise<SessionData> {
  try {
    // Generate browser fingerprint
    const fingerprint = await generateFingerprint()

    // Check for existing visitor with this fingerprint
    const { data: existingVisitors } = await supabase
      .from('visitor_sessions')
      .select('visitor_id')
      .eq('fingerprint', fingerprint)
      .order('created_at', { ascending: false })
      .limit(1)

    const isReturning = existingVisitors && existingVisitors.length > 0
    const visitorId = isReturning
      ? existingVisitors[0].visitor_id
      : crypto.randomUUID()

    const currentEpoch = getCurrentEpoch()

    // Create a new session
    const { data: session, error } = await supabase
      .from('visitor_sessions')
      .insert([
        {
          visitor_id: visitorId,
          fingerprint,
          is_returning: isReturning,
          started_at: currentEpoch,
          created_at: currentEpoch,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Store the session data
    currentSession = {
      sessionId: session.id,
      visitorId,
      fingerprint,
      isReturning,
    }

    // Request geolocation if consent is given
    const geoConsent = localStorage.getItem('geo_consent') === 'true'
    if (geoConsent) {
      captureGeolocation(session.id)
    }

    // Set up session end handler
    setupSessionEndHandler()

    return currentSession
  } catch (error) {
    console.error('Error initializing session:', error)
    // Fallback to a basic session
    const fallbackSession = {
      sessionId: crypto.randomUUID(),
      visitorId: crypto.randomUUID(),
      fingerprint: crypto.randomUUID(),
      isReturning: false,
    }
    currentSession = fallbackSession
    return fallbackSession
  }
}

/**
 * Get the current session data
 * If no session exists, initialize one
 */
export async function getSession(): Promise<SessionData> {
  if (!currentSession) {
    return await initSession()
  }
  return currentSession
}

/**
 * Capture geolocation data with user consent
 */
export async function captureGeolocation(
  sessionId: string,
  consent = true
): Promise<void> {
  try {
    // Save consent preference
    localStorage.setItem('geo_consent', consent.toString())

    if (!consent) return

    // Get geolocation
    const geoData = await requestGeolocation()
    if (!geoData) return

    // Get location details from coordinates
    const locationDetails = await reverseGeocode(
      geoData.latitude,
      geoData.longitude
    )
    const currentEpoch = getCurrentEpoch()

    // Save geolocation data
    await supabase.from('geolocation_data').insert([
      {
        session_id: sessionId,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        accuracy: geoData.accuracy,
        city: locationDetails?.city,
        region: locationDetails?.region,
        country: locationDetails?.country,
        postal_code: locationDetails?.postal_code,
        consent_given: true,
        created_at: currentEpoch,
      },
    ])
  } catch (error) {
    console.error('Error capturing geolocation:', error)
  }
}

/**
 * Save visitor personal data with consent
 */
export async function saveVisitorData(
  data: { name?: string; email?: string; phone?: string },
  consent = true
): Promise<void> {
  try {
    if (!currentSession || !consent) return

    const currentEpoch = getCurrentEpoch()

    await supabase.from('visitor_data').insert([
      {
        visitor_id: currentSession.visitorId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        consent_given: consent,
        consent_timestamp: currentEpoch,
        created_at: currentEpoch,
        updated_at: currentEpoch,
      },
    ])
  } catch (error) {
    console.error('Error saving visitor data:', error)
  }
}

/**
 * Set up handler to end the session when the user leaves
 */
function setupSessionEndHandler(): void {
  const endSession = async () => {
    if (!currentSession) return

    try {
      const currentEpoch = getCurrentEpoch()

      await supabase
        .from('visitor_sessions')
        .update({ ended_at: currentEpoch })
        .eq('id', currentSession.sessionId)
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  // Handle page unload
  window.addEventListener('beforeunload', endSession)

  // Handle visibility change (user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      endSession()
    }
  })
}

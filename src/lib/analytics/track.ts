import { supabase } from '@/lib/supabase/client'
import { parseUserAgent } from '@/lib/utils'
import { getSession } from './session'

/**
 * Track a link click with enhanced analytics
 */
export async function trackClick(linkId: string): Promise<void> {
  try {
    // Get current session
    const session = await getSession()

    // Get browser and device info
    const userAgent = navigator.userAgent
    const { browser, os, device } = parseUserAgent(userAgent)

    // Get screen info
    const screenSize = `${window.innerWidth}x${window.innerHeight}`
    const screenResolution = `${window.screen.width}x${window.screen.height}`

    // Get language and timezone
    const language = navigator.language
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Get referrer
    const referer = document.referrer

    // Record the click with enhanced data
    await supabase.from('clicks').insert([
      {
        link_id: linkId,
        session_id: session.sessionId,
        visitor_id: session.visitorId,
        fingerprint: session.fingerprint,
        ip: null, // IP is captured server-side
        referer,
        browser,
        os,
        device,
        screen_size: screenSize,
        screen_resolution: screenResolution,
        language,
        timezone,
        platform: navigator.platform,
        user_agent: userAgent,
      },
    ])
  } catch (error) {
    console.error('Error tracking click:', error)
  }
}

/**
 * Track a page view
 */
export async function trackPageView(
  pageUrl: string,
  pageTitle: string
): Promise<void> {
  try {
    // Get current session
    const session = await getSession()

    // Record page view (using the clicks table for simplicity)
    // In a more complex implementation, you might want a separate page_views table
    await supabase.from('clicks').insert([
      {
        link_id: null, // No specific link for page views
        session_id: session.sessionId,
        visitor_id: session.visitorId,
        fingerprint: session.fingerprint,
        referer: document.referrer,
        user_agent: navigator.userAgent,
        // Additional metadata
        title: pageTitle,
        url: pageUrl,
        type: 'page_view',
      },
    ])
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

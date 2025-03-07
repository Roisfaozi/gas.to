import { supabase } from '@/lib/supabase/client'
import { getCurrentEpoch, parseUserAgent } from '@/lib/utils'
import { getSession } from './session'

/**
 * Track a link click with enhanced analytics
 */
export async function trackClick(
  linkId: string,
  type: 'bio' | 'shortlink' | 'social' = 'shortlink'
): Promise<void> {
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

    // Get referrer and UTM parameters
    const referer = document.referrer
    const urlParams = new URLSearchParams(window.location.search)
    const utmSource = urlParams.get('utm_source')
    const utmMedium = urlParams.get('utm_medium')
    const utmCampaign = urlParams.get('utm_campaign')
    const utmTerm = urlParams.get('utm_term')
    const utmContent = urlParams.get('utm_content')

    const currentEpoch = getCurrentEpoch()

    // Record the click with enhanced data
    await supabase.from('clicks').insert([
      {
        link_id: linkId,
        session_id: session?.sessionId,
        visitor_id: session?.visitorId,
        fingerprint: session?.fingerprint,
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
        type,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm,
        utm_content: utmContent,
        created_at: currentEpoch,
        is_unique: true, // This will be handled by RLS policies
      },
    ])
  } catch (error) {
    console.error('Error tracking click:', error)
  }
}

/**
 * Track a bio page view
 */
export async function trackBioPageView(bioPageId: string): Promise<void> {
  try {
    const session = await getSession()
    const userAgent = navigator.userAgent
    const { browser, os, device } = parseUserAgent(userAgent)
    const urlParams = new URLSearchParams(window.location.search)
    const currentEpoch = getCurrentEpoch()

    await supabase.from('clicks').insert([
      {
        bio_page_id: bioPageId,
        session_id: session?.sessionId,
        visitor_id: session?.visitorId,
        fingerprint: session?.fingerprint,
        type: 'bio_view',
        referer: document.referrer,
        browser,
        os,
        device,
        user_agent: userAgent,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
        created_at: currentEpoch,
        is_unique: true,
      },
    ])
  } catch (error) {
    console.error('Error tracking bio page view:', error)
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
    const session = await getSession()
    const userAgent = navigator.userAgent
    const { browser, os, device } = parseUserAgent(userAgent)
    const urlParams = new URLSearchParams(window.location.search)
    const currentEpoch = getCurrentEpoch()

    await supabase.from('clicks').insert([
      {
        session_id: session?.sessionId,
        visitor_id: session?.visitorId,
        fingerprint: session?.fingerprint,
        type: 'page_view',
        url: pageUrl,
        title: pageTitle,
        referer: document.referrer,
        browser,
        os,
        device,
        user_agent: userAgent,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
        created_at: currentEpoch,
        is_unique: true,
      },
    ])
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

/**
 * Track user engagement
 */
export async function trackEngagement(
  type: 'scroll' | 'click' | 'hover',
  details: Record<string, any>
): Promise<void> {
  try {
    const session = await getSession()
    const currentEpoch = getCurrentEpoch()

    await supabase.from('user_engagement').insert([
      {
        session_id: session?.sessionId,
        visitor_id: session?.visitorId,
        type,
        details,
        created_at: currentEpoch,
      },
    ])
  } catch (error) {
    console.error('Error tracking engagement:', error)
  }
}

import { BioPageDisplay } from '@/components/bio/bio-page-display'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEpoch, parseUserAgent } from '@/lib/utils'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

export default async function BioPage({
  params: { username },
}: {
  params: { username: string }
}) {

  const supabase = createServerSupabaseClient()
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const referer = headersList.get('referer') || ''
  const ip = headersList.get('x-forwarded-for') || ''
  const language = headersList.get('accept-language') || ''

  // Get bio page with all related data
  const { data: bioPage, error } = await supabase
    .from('bio_pages')
    .select(`
        *,
        bio_links (
          id,
          title,
          url,
          icon,
          sort_order,
          is_active
        ),
        social_links (
          id,
          platform,
          url
        )
      `)
    .eq('username', username)
    .single()

  // Log error for debugging
  if (error) {
    console.error('Error fetching bio page:', error)
    notFound()
  }

  // If no bio page found
  if (!bioPage) {
    console.error(`Bio page not found for username: ${username}`)
    notFound()
  }

  // Check visibility
  if (bioPage.visibility === 'private') {
    // You might want to check if the viewer is the owner
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== bioPage.user_id) {
      return <BioPageDisplay bioPage={{ ...bioPage, bio_links: [], social_links: [] }} />
    }
  }

  // Track the page view with enhanced analytics
  const { browser, os, device } = parseUserAgent(userAgent)
  const currentEpoch = getCurrentEpoch()

  // Get UTM parameters
  const url = new URL(headers().get('referer') || '')
  const searchParams = new URLSearchParams(url.search)

  try {
    await supabase
      .from('clicks')
      .insert([
        {
          bio_page_id: bioPage.id,
          ip,
          referer,
          browser,
          os,
          device,
          user_agent: userAgent,
          language: language.split(',')[0],
          type: 'bio_view',
          utm_source: searchParams.get('utm_source'),
          utm_medium: searchParams.get('utm_medium'),
          utm_campaign: searchParams.get('utm_campaign'),
          created_at: currentEpoch,
          is_unique: true
        },
      ])
  } catch (analyticsError) {
    console.error('Error recording analytics:', analyticsError)
    // Continue even if analytics fails
  }

  // Ensure bio_links and social_links are arrays
  const processedBioPage = {
    ...bioPage,
    bio_links: Array.isArray(bioPage.bio_links) ? bioPage.bio_links : [],
    social_links: Array.isArray(bioPage.social_links) ? bioPage.social_links : []
  }

  return <BioPageDisplay bioPage={processedBioPage} />

}
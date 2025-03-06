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
  try {
    const supabase = createServerSupabaseClient()
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || ''
    const referer = headersList.get('referer') || ''
    const ip = headersList.get('x-forwarded-for') || ''

    // Ambil session pengguna (login atau tidak)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Ambil data bio berdasarkan username
    const { data: bioPage, error } = await supabase
      .from('bio_pages')
      .select(
        `
        id,
        username,
        title,
        description,
        visibility,
        profile_image_url,
        social_image_url,
        theme_config,
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
      `
      )
      .eq('username', username)
      .maybeSingle()

    // Jika terjadi error atau tidak ditemukan, tampilkan halaman 404
    if (error || !bioPage) {
      console.error('Error fetching bio page:', error)
      return notFound()
    }

    // Jika halaman bio bersifat PRIVATE dan user belum login, redirect ke 404
    if (bioPage.visibility === 'private' && !session?.user) {
      return notFound()
    }

    // Tracking pengunjung halaman bio
    const { browser, os, device } = parseUserAgent(userAgent)
    const currentEpoch = getCurrentEpoch()

    try {
      await supabase.from('clicks').insert([
        {
          link_id: null, // Tidak terkait dengan link shortener
          bio_page_id: bioPage.id,
          ip,
          referer,
          browser,
          os,
          device,
          user_agent: userAgent,
          type: 'bio_view',
          created_at: currentEpoch,
        },
      ])
    } catch (analyticsError) {
      console.error('Error recording analytics:', analyticsError)
    }

    // Pastikan data `bio_links` dan `social_links` selalu berbentuk array
    const processedBioPage = {
      ...bioPage,
      username: bioPage.username || 'Anonymous', // Jika username kosong, gunakan default
      bio_links: Array.isArray(bioPage.bio_links) ? bioPage.bio_links : [],
      social_links: Array.isArray(bioPage.social_links) ? bioPage.social_links : [],
    }

    return <BioPageDisplay bioPage={processedBioPage} />
  } catch (error) {
    console.error('Unexpected error in BioPage:', error)
    return notFound()
  }
}
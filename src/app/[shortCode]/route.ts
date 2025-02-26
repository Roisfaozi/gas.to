import { createServerSupabaseClient } from '@/lib/supabase/server'
import { parseUserAgent } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const shortCode = params.shortCode
  const headersList = headers()
  const pathname = headersList.get('x-next-pathname') || ''

  const supabase = createServerSupabaseClient()
  const userAgent = headersList.get('user-agent') || ''
  const referer = headersList.get('referer') || ''
  const ip = headersList.get('x-forwarded-for') || ''

  // Fetch geo data
  let geoData = null
  if (ip && ip !== '::1') {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`)
      geoData = await response.json()
    } catch (error) {
      console.error('Error fetching geo data:', error)
    }
  }

  // Get the link
  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', shortCode)
    .single()

  if (
    !link ||
    !link.is_active ||
    (link.expires_at && new Date(link.expires_at) < new Date())
  ) {
    return NextResponse.json(
      {
        error: 'No url found',
      },
      {
        status: 404,
      }
    )
  }

  // Parse user agent
  const { browser, os, device } = parseUserAgent(userAgent)

  // Check if click is unique
  const { data: existingClick } = await supabase
    .from('clicks')
    .select('id')
    .eq('link_id', link.id)
    .eq('ip', ip)
    .eq('user_agent', userAgent)
    .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle()

  if (!existingClick) {
    await supabase.from('clicks').insert([
      {
        link_id: link.id,
        ip,
        referer,
        browser,
        os,
        device,
        user_agent: userAgent,
        city: geoData?.city || null,
        country: geoData?.country || null,
        is_unique: true,
      },
    ])
  } else {
    console.log('Klik sudah ada, menyimpan sebagai non-unik.')
    await supabase.from('clicks').insert([
      {
        link_id: link.id,
        ip,
        referer,
        browser,
        os,
        device,
        user_agent: userAgent,
        city: geoData?.city || null,
        country: geoData?.country || null,
        is_unique: false,
      },
    ])
  }

  revalidatePath('/dashboard')
  return NextResponse.redirect(link.original_url || '/', {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

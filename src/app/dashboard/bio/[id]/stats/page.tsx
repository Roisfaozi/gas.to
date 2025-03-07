import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BioStats } from '@/components/stats/bio-stats'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function BioStatsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()

  // Get bio page with click data
  const { data: bioPage } = await supabase
    .from('bio_pages')
    .select(`
      *,
      clicks (
        id,
        created_at,
        ip,
        city,
        country,
        device,
        browser,
        os,
        referer,
        utm_source,
        utm_medium,
        utm_campaign,
        screen_size,
        language
      ),
      bio_links (
        id,
        title,
        url,
        clicks (
          id,
          created_at,
          ip,
          city,
          country,
          device,
          browser,
          os,
          referer
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!bioPage) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bio Page Statistics</h1>
          <a
            href={`/bio/${bioPage.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900"
          >
            {`${process.env.NEXT_PUBLIC_APP_URL}/bio/${bioPage.username}`}
          </a>
        </div>
        <BioStats bioPage={bioPage} />
      </div>
    </DashboardLayout>
  )
}
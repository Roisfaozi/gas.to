import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LinkStats } from '@/components/stats/link-stats'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function LinkStatsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()

  // Get link with click data
  const { data: link } = await supabase
    .from('links')
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
      )
    `)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!link) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Link Statistics</h1>
          <a
            href={`/${link.short_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900"
          >
            {`${process.env.NEXT_PUBLIC_APP_URL}/${link.short_code}`}
          </a>
        </div>
        <LinkStats link={link} />
      </div>
    </DashboardLayout>
  )
}
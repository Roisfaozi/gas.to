import { ClicksChart } from '@/components/dashboard/clicks-chart'
import { ClickActivity, RecentActivity } from '@/components/dashboard/recent-activity'
import { RecentLinks } from '@/components/dashboard/recent-links'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CreateLinkForms } from '@/components/links/create-link-forms'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calculateGrowth } from '@/lib/utils'
import { format, subDays } from 'date-fns'


export default async function DashboardPage() {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()

  // Get today's and yesterday's date
  const today = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const yesterday = subDays(today, 1)
  const twoMonthsAgo = subDays(today, 60)

  // Get today's stats
  const { data: todayLinks } = await supabase
    .from('links')
    .select('id')
    .eq('user_id', session.user.id)
    .gte('created_at', format(today, 'yyyy-MM-dd'))

  const { data: todayClicks, error } = await supabase
    .from('clicks')
    .select('id, links(*)')
    .eq('links.user_id', session.user.id)
    .gte('created_at', format(today, 'yyyy-MM-dd'))
  // Get yesterday's stats
  const { data: yesterdayLinks } = await supabase
    .from('links')
    .select('id')
    .eq('user_id', session.user.id)
    .gte('created_at', format(yesterday, 'yyyy-MM-dd'))
    .lt('created_at', format(today, 'yyyy-MM-dd'))

  const { data: yesterdayClicks } = await supabase
    .from('clicks')
    .select('id')
    .eq('user_id', session.user.id)
    .gte('created_at', format(yesterday, 'yyyy-MM-dd'))
    .lt('created_at', format(today, 'yyyy-MM-dd'))

  // Get clicks data for the chart (last 60 days)
  const { data: clicksData } = await supabase
    .from('clicks')
    .select('created_at, links(*)')
    .eq('links.user_id', session.user.id)
    .gte('created_at', format(twoMonthsAgo, 'yyyy-MM-dd'))
    .order('created_at', { ascending: true });
  // Get recent links and bio pages
  const { data: recentLinks } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: bioPages } = await supabase
    .from('bio_pages')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get recent click activities
  const { data: recentClicks } = await supabase
    .from('clicks')
    .select(`
      id,
      created_at,
      ip,
      city,
      country,
      device,
      browser,
      os,
      referer,
      user_agent,
      links!inner (
        id,
        title,
        short_code,
        bio_page_id
      )
    `)
    .eq('links.user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Process clicks data for the chart
  const clicksByDay = clicksData?.reduce((acc, click) => {
    const day = format(new Date(click.created_at), 'yyyy-MM-dd')
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {}) || {}


  const chartData = Object.entries(clicksByDay).map(([date, count]) => ({
    date,
    clicks: count,
  }))

  // Calculate growth percentages
  const linksGrowth = calculateGrowth(
    todayLinks?.length || 0,
    yesterdayLinks?.length || 0
  )

  const clicksGrowth = calculateGrowth(
    todayClicks?.length || 0,
    yesterdayClicks?.length || 0
  )

  // Combine and format recent links and bio pages
  const combinedLinks = [
    ...(recentLinks?.map(link => ({
      id: link.id,
      type: 'shortlink' as const,
      status: link.is_active ? 'online' as const : 'disabled' as const,
      visibility: 'public' as const,
      title: link.title || 'Untitled Link',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${link.short_code}`,
      created_at: link.created_at,
    })) || []),
    ...(bioPages?.map(page => ({
      id: page.id,
      type: 'bio' as const,
      status: 'online' as const,
      visibility: 'public' as const,
      title: page.title,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/bio/${page.username}`,
      created_at: page.created_at,
    })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Format recent activities
  const recentActivities = recentClicks?.map((click) => {
    const link = Array.isArray(click.links) ? click.links[0] : click.links;
    return {
      id: click.id,
      type: link?.bio_page_id ? 'bio' : 'shortlink',
      title: link?.title || 'Untitled Link',
      url: link?.bio_page_id
        ? `${process.env.NEXT_PUBLIC_APP_URL}/bio/${link?.short_code}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/${link?.short_code}`,
      visited_at: click.created_at,
      city: click.city || 'Unknown',
      country: click.country || 'Unknown',
      os: click.os || 'Unknown',
      browser: click.browser || 'Unknown',
      referer: click.referer,
      language: click.user_agent?.includes('lang=')
        ? click.user_agent.split('lang=')[1].split(';')[0]
        : 'Unknown',
    }
  }) || []
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatsCard
            title="Today's Links"
            value={todayLinks?.length || 0}
            change={linksGrowth}
            changeLabel="from yesterday"
          />
          <StatsCard
            title="Today's Clicks"
            value={todayClicks?.length || 0}
            change={clicksGrowth}
            changeLabel="from yesterday"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Clicks Over Time
          </h2>
          <div className="h-[400px]">
            <ClicksChart data={chartData.map(({ date, clicks }) => ({ date, clicks: Number(clicks) }))} />
          </div>
        </div>

        <CreateLinkForms />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLinks links={combinedLinks} />
          <RecentActivity activities={recentActivities as ClickActivity[]} />
        </div>
      </div>
    </DashboardLayout>
  )
}
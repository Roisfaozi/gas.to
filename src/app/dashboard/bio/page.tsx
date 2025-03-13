import { BioPageGrid } from '@/components/bio/bio-page-grid'
import { BioPageStats } from '@/components/bio/bio-page-stats'
import { CreateBioButton } from '@/components/bio/create-bio-button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function BioPages() {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()

  // Get bio pages with total views
  const { data: bioPages } = await supabase
    .from('bio_pages')
    .select(`
      *,
      clicks:links(
        count
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  // Calculate total views across all bio pages
  const totalViews = bioPages?.reduce((sum, page) => sum + (page.clicks?.[0]?.count || 0), 0) || 0
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bio Pages</h1>
          <CreateBioButton />
        </div>

        <BioPageStats totalPages={bioPages?.length || 0} totalViews={totalViews} />

        <BioPageGrid bioPages={bioPages || []} />
      </div>
    </DashboardLayout>
  )
}
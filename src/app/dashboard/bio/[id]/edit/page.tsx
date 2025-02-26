import { EditBioForm } from '@/components/bio/edit-bio-form'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditBioPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()

  // Get bio page with all related data
  const { data: bioPage } = await supabase
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
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!bioPage) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Bio Page</h1>
            <p className="mt-1 text-sm text-gray-500">
              Customize your bio page appearance and content
            </p>
          </div>
          <EditBioForm bioPage={bioPage} />
        </div>
      </div>
    </DashboardLayout>
  )
}
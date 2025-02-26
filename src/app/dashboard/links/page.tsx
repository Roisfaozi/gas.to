import { requireAuth } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { LinkList } from '@/components/links/link-list'
import { CreateLinkButton } from '@/components/links/create-link-button'

export default async function LinksPage() {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()
  
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Your Links</h1>
            <CreateLinkButton />
          </div>
        </div>
        <LinkList links={links || []} />
      </div>
    </DashboardLayout>
  )
}
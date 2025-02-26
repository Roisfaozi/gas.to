import { requireAuth } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const session = await requireAuth()
  const supabase = createServerSupabaseClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
          <ProfileForm user={user} />
        </div>
      </div>
    </DashboardLayout>
  )
}
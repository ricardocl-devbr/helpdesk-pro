import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Profile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar profile={profile as Profile} />
      <main className="flex-1 ml-[240px] overflow-y-auto">{children}</main>
    </div>
  )
}

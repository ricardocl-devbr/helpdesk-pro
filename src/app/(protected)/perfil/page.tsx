import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { PerfilForm } from '@/components/perfil/PerfilForm'
import type { Profile } from '@/types'

export default async function PerfilPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div>
      <Header title="My Profile" profile={profile as Profile} />
      <div className="p-6">
        <PerfilForm profile={profile as Profile} />
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { AgentesClient } from './AgentesClient'
import type { Profile } from '@/types'

export default async function AgentesPage() {
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
  if (profile.role !== 'admin') redirect('/dashboard')

  const { data: agents } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'agent'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <Header title="Agents" profile={profile as Profile} />
      <AgentesClient agents={(agents ?? []) as Profile[]} />
    </div>
  )
}

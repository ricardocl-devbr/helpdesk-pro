import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { TicketsClient } from './TicketsClient'
import type { TicketRow } from './TicketsClient'
import type { Profile } from '@/types'

export default async function TicketsPage() {
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

  let query = supabase
    .from('tickets')
    .select(
      '*, categoria:categorias(id, nome, cor), cliente:profiles!tickets_cliente_id_fkey(id, full_name, email)'
    )
    .order('created_at', { ascending: false })

  if (profile.role === 'cliente') {
    query = query.eq('cliente_id', user.id)
  }

  const { data: tickets } = await query

  return (
    <div>
      <Header title="Tickets" profile={profile as Profile} />
      <TicketsClient tickets={(tickets ?? []) as TicketRow[]} profile={profile as Profile} />
    </div>
  )
}

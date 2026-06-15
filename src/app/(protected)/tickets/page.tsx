import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { TicketsClient } from './TicketsClient'
import type { TicketRow, TicketFilters } from './TicketsClient'
import type { Profile, Categoria } from '@/types'

interface SearchParams {
  status?: string
  prioridade?: string
  categoria_id?: string
  busca?: string
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
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

  const { status, prioridade, categoria_id, busca } = await searchParams

  let query = supabase
    .from('tickets')
    .select(
      '*, categoria:categories(id, name, color), cliente:profiles!customer_id(id, full_name, email)'
    )
    .order('created_at', { ascending: false })

  if (profile.role === 'customer') {
    query = query.eq('customer_id', user.id)
  }

  if (status) query = query.eq('status', status)
  if (prioridade) query = query.eq('priority', prioridade)
  if (categoria_id) query = query.eq('category_id', categoria_id)
  if (busca) query = query.ilike('title', `%${busca}%`)

  const [{ data: tickets, error: ticketsError }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('id, name, color, ativa').order('name'),
  ])

  if (ticketsError) console.error('Tickets query error:', ticketsError)

  const filters: TicketFilters = {
    status: status ?? '',
    prioridade: prioridade ?? '',
    categoria_id: categoria_id ?? '',
    busca: busca ?? '',
  }

  return (
    <div>
      <Header title="Tickets" profile={profile as Profile} />
      <Suspense>
        <TicketsClient
          tickets={(tickets ?? []) as TicketRow[]}
          profile={profile as Profile}
          filters={filters}
          categories={(categories ?? []) as Pick<Categoria, 'id' | 'name' | 'color' | 'ativa'>[]}
        />
      </Suspense>
    </div>
  )
}

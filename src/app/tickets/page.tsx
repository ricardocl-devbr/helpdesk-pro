import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORIDADE_COLORS,
  PRIORIDADE_LABELS,
} from '@/lib/constants'
import type { Profile, StatusTicket, PrioridadeTicket } from '@/types'

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

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Lista de Tickets</h2>
          <Link href="/tickets/novo">
            <Button>Novo Ticket</Button>
          </Link>
        </div>

        {!tickets || tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-muted-foreground text-sm">Nenhum ticket encontrado.</p>
            <Link href="/tickets/novo">
              <Button variant="outline">Criar primeiro ticket</Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{ticket.numero}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {ticket.titulo}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[ticket.status as StatusTicket]}>
                        {STATUS_LABELS[ticket.status as StatusTicket]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={PRIORIDADE_COLORS[ticket.prioridade as PrioridadeTicket]}
                      >
                        {PRIORIDADE_LABELS[ticket.prioridade as PrioridadeTicket]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(ticket.categoria as { nome: string } | null)?.nome ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

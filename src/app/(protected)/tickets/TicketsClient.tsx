'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { NovoTicketModal } from '@/components/tickets/NovoTicketModal'
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORIDADE_COLORS,
  PRIORIDADE_LABELS,
} from '@/lib/constants'
import type { Profile, StatusTicket, PrioridadeTicket } from '@/types'

export interface TicketRow {
  id: string
  numero: number
  titulo: string
  status: string
  prioridade: string
  created_at: string
  categoria: { nome: string } | null
}

interface TicketsClientProps {
  tickets: TicketRow[]
  profile: Profile
}

export function TicketsClient({ tickets, profile }: TicketsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Lista de Tickets</h2>
        <Button onClick={() => setModalOpen(true)}>Novo Ticket</Button>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-muted-foreground text-sm">Nenhum ticket encontrado.</p>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Criar primeiro ticket
          </Button>
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
                    <Badge className={PRIORIDADE_COLORS[ticket.prioridade as PrioridadeTicket]}>
                      {PRIORIDADE_LABELS[ticket.prioridade as PrioridadeTicket]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.categoria?.nome ?? '—'}
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

      <NovoTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

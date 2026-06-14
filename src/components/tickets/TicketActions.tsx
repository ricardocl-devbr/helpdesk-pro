'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { appToast } from '@/lib/toast'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_LABELS, PRIORIDADE_LABELS } from '@/lib/constants'
import type { Ticket, Profile, StatusTicket, PrioridadeTicket } from '@/types'

interface TicketActionsProps {
  ticket: Ticket
  currentUserRole: string
  currentUserId: string
  agentList: Profile[]
}

export function TicketActions({
  ticket,
  currentUserRole,
  currentUserId,
  agentList,
}: TicketActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (currentUserRole !== 'admin' && currentUserRole !== 'agente') return null

  async function handleChange(
    field: 'status' | 'prioridade' | 'agente_id',
    tipoEvento: 'status_changed' | 'prioridade_changed' | 'agente_assigned',
    oldValue: string | null,
    newValue: string | null
  ) {
    if (newValue === oldValue) return
    setLoading(true)
    const supabase = createBrowserClient()

    const updatePayload: Partial<Ticket> = { [field]: newValue }
    const { error: updateError } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', ticket.id)

    if (updateError) {
      appToast.error('Failed to update ticket.')
      setLoading(false)
      return
    }

    const { error: eventError } = await supabase.from('ticket_eventos').insert({
      ticket_id: ticket.id,
      autor_id: currentUserId,
      tipo_evento: tipoEvento,
      valor_antigo: oldValue,
      valor_novo: newValue,
    })

    if (eventError) {
      console.error('ticket_eventos insert failed:', eventError.message, eventError.code)
    }

    appToast.success('Ticket updated.')
    setLoading(false)
    router.refresh()
  }

  const statusEntries = Object.entries(STATUS_LABELS) as [StatusTicket, string][]
  const prioridadeEntries = Object.entries(PRIORIDADE_LABELS) as [PrioridadeTicket, string][]

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
        <Select
          disabled={loading}
          defaultValue={ticket.status}
          onValueChange={(v) =>
            handleChange('status', 'status_changed', ticket.status, v)
          }
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusEntries.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</span>
        <Select
          disabled={loading}
          defaultValue={ticket.prioridade}
          onValueChange={(v) =>
            handleChange('prioridade', 'prioridade_changed', ticket.prioridade, v)
          }
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prioridadeEntries.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Assigned Agent
        </span>
        <Select
          disabled={loading}
          defaultValue={ticket.agente_id ?? '__unassigned__'}
          onValueChange={(v) =>
            handleChange('agente_id', 'agente_assigned', ticket.agente_id, v === '__unassigned__' ? null : v)
          }
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__unassigned__">Unassigned</SelectItem>
            {agentList.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

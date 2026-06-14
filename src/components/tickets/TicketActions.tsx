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

  if (currentUserRole !== 'admin' && currentUserRole !== 'agent') return null

  async function handleChange(
    field: 'status' | 'priority' | 'agent_id',
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

    const { error: eventError } = await supabase.from('ticket_events').insert({
      ticket_id: ticket.id,
      author_id: currentUserId,
      event_type: tipoEvento,
      old_value: oldValue,
      new_value: newValue,
    })

    if (eventError) {
      console.error('ticket_events insert failed:', eventError.message, eventError.code)
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
          defaultValue={ticket.priority}
          onValueChange={(v) =>
            handleChange('priority', 'prioridade_changed', ticket.priority, v)
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
          defaultValue={ticket.agent_id ?? '__unassigned__'}
          onValueChange={(v) =>
            handleChange('agent_id', 'agente_assigned', ticket.agent_id, v === '__unassigned__' ? null : v)
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

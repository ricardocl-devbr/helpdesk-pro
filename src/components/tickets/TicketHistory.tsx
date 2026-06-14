'use client'

import { ArrowRight, Flag, User } from 'lucide-react'
import { timeAgo } from '@/lib/utils/ticket'
import { STATUS_LABELS, PRIORIDADE_LABELS } from '@/lib/constants'
import type { TicketEventoComAutor, Profile } from '@/types'

interface TicketHistoryProps {
  events: TicketEventoComAutor[]
  agentList: Profile[]
}

function resolveLabel(tipoEvento: string, value: string | null, agentList: Profile[]): string {
  if (!value) return 'Unassigned'
  if (tipoEvento === 'status_changed') {
    return STATUS_LABELS[value as keyof typeof STATUS_LABELS] ?? value
  }
  if (tipoEvento === 'prioridade_changed') {
    return PRIORIDADE_LABELS[value as keyof typeof PRIORIDADE_LABELS] ?? value
  }
  if (tipoEvento === 'agente_assigned') {
    return agentList.find((a) => a.id === value)?.full_name ?? value
  }
  return value
}

const EVENT_META: Record<
  string,
  { icon: React.ElementType; field: string; iconClass: string }
> = {
  status_changed: { icon: ArrowRight, field: 'status', iconClass: 'text-blue-500' },
  prioridade_changed: { icon: Flag, field: 'priority', iconClass: 'text-orange-500' },
  agente_assigned: { icon: User, field: 'assigned agent', iconClass: 'text-indigo-500' },
}

export function TicketHistory({ events, agentList }: TicketHistoryProps) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">No changes recorded yet.</p>
    )
  }

  return (
    <ol className="space-y-3">
      {events.map((event, i) => {
        const meta = EVENT_META[event.event_type]
        if (!meta) return null
        const Icon = meta.icon
        const oldLabel = resolveLabel(event.event_type, event.old_value, agentList)
        const newLabel = resolveLabel(event.event_type, event.new_value, agentList)

        return (
          <li key={event.id} className="flex gap-3 text-sm">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 ${meta.iconClass}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {i < events.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-gray-200" />
              )}
            </div>
            <div className="pb-3">
              <p className="text-gray-700">
                <span className="font-medium">{event.autor.full_name}</span>
                {' changed '}
                <span className="font-medium">{meta.field}</span>
                {' from '}
                <span className="text-gray-500">{oldLabel}</span>
                {' to '}
                <span className="font-medium text-gray-900">{newLabel}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{timeAgo(event.created_at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

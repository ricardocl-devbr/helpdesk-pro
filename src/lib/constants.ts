import type { StatusTicket, PrioridadeTicket, RolePerfil } from '@/types'

export const STATUS_LABELS: Record<StatusTicket, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_for_customer: 'Waiting for Customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const STATUS_COLORS: Record<StatusTicket, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_for_customer: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export const PRIORIDADE_LABELS: Record<PrioridadeTicket, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const PRIORIDADE_COLORS: Record<PrioridadeTicket, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export const ROLE_LABELS: Record<RolePerfil, string> = {
  admin: 'Admin',
  agent: 'Agent',
  customer: 'Customer',
}

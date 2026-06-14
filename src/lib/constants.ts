import type { StatusTicket, PrioridadeTicket, RolePerfil } from '@/types'

export const STATUS_LABELS: Record<StatusTicket, string> = {
  aberto: 'Open',
  em_andamento: 'In Progress',
  aguardando_cliente: 'Waiting for Customer',
  resolvido: 'Resolved',
  fechado: 'Closed',
}

export const STATUS_COLORS: Record<StatusTicket, string> = {
  aberto: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_cliente: 'bg-purple-100 text-purple-800',
  resolvido: 'bg-green-100 text-green-800',
  fechado: 'bg-gray-100 text-gray-800',
}

export const PRIORIDADE_LABELS: Record<PrioridadeTicket, string> = {
  baixa: 'Low',
  media: 'Medium',
  alta: 'High',
  urgente: 'Urgent',
}

export const PRIORIDADE_COLORS: Record<PrioridadeTicket, string> = {
  baixa: 'bg-gray-100 text-gray-800',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
}

export const ROLE_LABELS: Record<RolePerfil, string> = {
  admin: 'Admin',
  agente: 'Agent',
  cliente: 'Customer',
}

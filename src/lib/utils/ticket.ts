import type { StatusTicket, PrioridadeTicket } from '@/types'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORIDADE_LABELS,
  PRIORIDADE_COLORS,
} from '@/lib/constants'

export function getStatusBadgeProps(status: StatusTicket): { label: string; className: string } {
  return {
    label: STATUS_LABELS[status],
    className: STATUS_COLORS[status],
  }
}

export function getPrioridadeBadgeProps(prioridade: PrioridadeTicket): { label: string; className: string } {
  return {
    label: PRIORIDADE_LABELS[prioridade],
    className: PRIORIDADE_COLORS[prioridade],
  }
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function timeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return 'há poucos segundos'
  if (diffMinutes < 60) return `há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 30) return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
  if (diffMonths < 12) return `há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`
  return `há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`
}

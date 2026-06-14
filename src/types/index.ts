// ─── Union Types ─────────────────────────────────────────────────────────────

export type RolePerfil = 'admin' | 'agent' | 'customer'

export type StatusTicket =
  | 'open'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'resolved'
  | 'closed'

export type PrioridadeTicket = 'low' | 'medium' | 'high' | 'urgent'

// ─── Base Entities ────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: RolePerfil
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  name: string
  color: string
  description: string | null
  ativa: boolean
  created_at: string
}

export interface Ticket {
  id: string
  numero: number
  title: string
  description: string
  status: StatusTicket
  priority: PrioridadeTicket
  category_id: string
  customer_id: string
  agent_id: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface Mensagem {
  id: string
  ticket_id: string
  author_id: string
  content: string
  internal: boolean
  created_at: string
}

// ─── Composite Types (with joins) ─────────────────────────────────────────────

export interface TicketComDetalhes extends Ticket {
  categoria: Categoria
  cliente: Profile
  agente: Profile | null
}

export interface MensagemComAutor extends Mensagem {
  autor: Profile
}

export type TipoEvento = 'status_changed' | 'prioridade_changed' | 'agente_assigned'

export interface TicketEvento {
  id: string
  ticket_id: string
  author_id: string
  event_type: TipoEvento
  old_value: string | null
  new_value: string | null
  created_at: string
}

export interface TicketEventoComAutor extends TicketEvento {
  autor: Pick<Profile, 'id' | 'full_name'>
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  avgResponseTime: number
}

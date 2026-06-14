// ─── Union Types ─────────────────────────────────────────────────────────────

export type RolePerfil = 'admin' | 'agente' | 'cliente'

export type StatusTicket =
  | 'aberto'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'resolvido'
  | 'fechado'

export type PrioridadeTicket = 'baixa' | 'media' | 'alta' | 'urgente'

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
  nome: string
  cor: string
  descricao: string | null
  ativa: boolean
  created_at: string
}

export interface Ticket {
  id: string
  numero: number
  titulo: string
  descricao: string
  status: StatusTicket
  prioridade: PrioridadeTicket
  categoria_id: string
  cliente_id: string
  agente_id: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface Mensagem {
  id: string
  ticket_id: string
  autor_id: string
  conteudo: string
  interno: boolean
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
  autor_id: string
  tipo_evento: TipoEvento
  valor_antigo: string | null
  valor_novo: string | null
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

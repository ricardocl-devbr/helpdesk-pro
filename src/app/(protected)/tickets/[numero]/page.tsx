import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ConversationPanel } from '@/components/tickets/ConversationPanel'
import { FormularioResposta } from '@/components/tickets/FormularioResposta'
import { TicketActions } from '@/components/tickets/TicketActions'
import { TicketHistory } from '@/components/tickets/TicketHistory'
import { TicketRealtimeSync } from '@/components/tickets/TicketRealtimeSync'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORIDADE_LABELS,
  PRIORIDADE_COLORS,
} from '@/lib/constants'
import type { Profile, TicketComDetalhes, MensagemComAutor, TicketEventoComAutor } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
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

  const { data: ticket } = await supabase
    .from('tickets')
    .select(
      '*, categoria:categories(id, name, color), cliente:profiles!customer_id(id, full_name, email), agente:profiles!agent_id(id, full_name, email)'
    )
    .eq('numero', Number(numero))
    .single()

  if (!ticket) redirect('/tickets')

  const { data: messages } = await supabase
    .from('messages')
    .select('*, autor:profiles(id, full_name, avatar_url, role)')
    .eq('ticket_id', ticket.id)
    .eq('internal', false)
    .order('created_at', { ascending: true })

  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url, created_at, updated_at')
    .in('role', ['admin', 'agent'])

  const { data: events } = await supabase
    .from('ticket_events')
    .select('*, autor:profiles(id, full_name)')
    .eq('ticket_id', ticket.id)
    .order('created_at', { ascending: true })

  const t = ticket as TicketComDetalhes
  const msgs = (messages ?? []) as MensagemComAutor[]
  const agentList = (agents ?? []) as Profile[]
  const ticketEvents = (events ?? []) as TicketEventoComAutor[]

  return (
    <div>
      <TicketRealtimeSync ticketId={t.id} />
      <Header
        title={`Ticket #${t.numero} — ${t.title}`}
        profile={profile as Profile}
      />

      <div className="p-6 flex gap-6 items-start">
        {/* Left column: conversation + form */}
        <div className="flex-2 min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationPanel
                initialMessages={msgs}
                ticketId={t.id}
                currentUser={profile as Profile}
                ticketDescription={t.description}
                ticketCustomer={t.cliente}
                ticketCreatedAt={t.created_at}
              />
            </CardContent>
          </Card>

          {/* Reply form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <FormularioResposta ticketId={t.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right column: ticket details */}
        <div className="flex-1 min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {profile.role === 'admin' || profile.role === 'agent' ? (
                <TicketActions
                  ticket={t}
                  currentUserRole={profile.role}
                  currentUserId={profile.id}
                  agentList={agentList}
                />
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </span>
                    <div>
                      <Badge className={STATUS_COLORS[t.status]}>
                        {STATUS_LABELS[t.status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Priority
                    </span>
                    <div>
                      <Badge className={PRIORIDADE_COLORS[t.priority]}>
                        {PRIORIDADE_LABELS[t.priority]}
                      </Badge>
                    </div>
                  </div>
                </>
              )}

              {t.categoria && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Category
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.categoria.color }}
                    />
                    <span className="text-gray-700">{t.categoria.name}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Customer
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-800">
                      {initials(t.cliente.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {t.cliente.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{t.cliente.email}</p>
                  </div>
                </div>
              </div>

              {t.agente && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Agent
                  </span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-800">
                        {initials(t.agente.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {t.agente.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{t.agente.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Created at</span>
                  <span>{formatDate(t.created_at)}</span>
                </div>
                {t.resolved_at && (
                  <div className="flex justify-between">
                    <span>Resolved at</span>
                    <span>{formatDate(t.resolved_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">History</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketHistory events={ticketEvents} agentList={agentList} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

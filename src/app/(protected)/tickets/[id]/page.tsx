import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { FormularioResposta } from '@/components/tickets/FormularioResposta'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORIDADE_LABELS,
  PRIORIDADE_COLORS,
} from '@/lib/constants'
import type { Profile, TicketComDetalhes, MensagemComAutor } from '@/types'

function formatarData(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
      '*, categoria:categorias(id, nome, cor), cliente:profiles!tickets_cliente_id_fkey(id, full_name, email), agente:profiles!tickets_agente_id_fkey(id, full_name, email)'
    )
    .eq('id', id)
    .single()

  if (!ticket) redirect('/tickets')

  const { data: mensagens } = await supabase
    .from('mensagens')
    .select('*, autor:profiles(id, full_name, avatar_url, role)')
    .eq('ticket_id', id)
    .eq('interno', false)
    .order('created_at', { ascending: true })

  const t = ticket as TicketComDetalhes
  const msgs = (mensagens ?? []) as MensagemComAutor[]

  return (
    <div>
      <Header
        title={`Ticket #${t.numero} — ${t.titulo}`}
        profile={profile as Profile}
      />

      <div className="p-6 flex gap-6 items-start">
        {/* Coluna esquerda: conversa + formulário */}
        <div className="flex-[2] min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Conversa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Descrição inicial do ticket */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                    {iniciais(t.cliente.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {t.cliente.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatarData(t.created_at)}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {t.descricao}
                  </div>
                </div>
              </div>

              {msgs.length > 0 && <Separator />}

              {/* Mensagens */}
              {msgs.map((msg) => {
                const isCliente = msg.autor.role === 'cliente'
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isCliente ? '' : 'flex-row-reverse'}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarImage
                        src={msg.autor.avatar_url ?? undefined}
                        alt={msg.autor.full_name}
                      />
                      <AvatarFallback
                        className={`text-xs ${
                          isCliente
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {iniciais(msg.autor.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 min-w-0 ${isCliente ? '' : 'flex flex-col items-end'}`}
                    >
                      <div
                        className={`flex items-baseline gap-2 mb-1 ${
                          isCliente ? '' : 'flex-row-reverse'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {msg.autor.full_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatarData(msg.created_at)}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap max-w-prose ${
                          isCliente
                            ? 'bg-gray-50 text-gray-700'
                            : 'bg-indigo-50 text-indigo-900'
                        }`}
                      >
                        {msg.conteudo}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Formulário de resposta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Responder</CardTitle>
            </CardHeader>
            <CardContent>
              <FormularioResposta ticketId={t.id} />
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita: detalhes do ticket */}
        <div className="flex-[1] min-w-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
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
                  Prioridade
                </span>
                <div>
                  <Badge className={PRIORIDADE_COLORS[t.prioridade]}>
                    {PRIORIDADE_LABELS[t.prioridade]}
                  </Badge>
                </div>
              </div>

              {t.categoria && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Categoria
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.categoria.cor }}
                    />
                    <span className="text-gray-700">{t.categoria.nome}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Cliente
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-800">
                      {iniciais(t.cliente.full_name)}
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
                    Agente
                  </span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-800">
                        {iniciais(t.agente.full_name)}
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
                  <span>Criado em</span>
                  <span>{formatarData(t.created_at)}</span>
                </div>
                {t.resolved_at && (
                  <div className="flex justify-between">
                    <span>Resolvido em</span>
                    <span>{formatarData(t.resolved_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

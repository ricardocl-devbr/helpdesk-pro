import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import type { Profile, StatusTicket } from '@/types'

export default async function DashboardPage() {
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

  const isCliente = profile.role === 'cliente'

  const baseCount = () => {
    const q = supabase.from('tickets').select('*', { count: 'exact', head: true })
    return isCliente ? q.eq('cliente_id', user.id) : q
  }

  const recentesQuery = () => {
    const q = supabase
      .from('tickets')
      .select('id, titulo, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    return isCliente ? q.eq('cliente_id', user.id) : q
  }

  const [
    { count: total },
    { count: abertos },
    { count: em_andamento },
    { count: resolvidos },
    { data: recentes },
  ] = await Promise.all([
    baseCount(),
    baseCount().eq('status', 'aberto'),
    baseCount().eq('status', 'em_andamento'),
    baseCount().eq('status', 'resolvido'),
    recentesQuery(),
  ])

  const metrics = [
    { label: 'Total de Tickets', value: total ?? 0 },
    { label: 'Abertos', value: abertos ?? 0 },
    { label: 'Em Andamento', value: em_andamento ?? 0 },
    { label: 'Resolvidos', value: resolvidos ?? 0 },
  ]

  return (
    <div>
      <Header title="Dashboard" profile={profile as Profile} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {m.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Tickets Recentes</h2>

          {!recentes || recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum ticket encontrado.</p>
          ) : (
            <Card>
              <ul className="divide-y divide-border">
                {recentes.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm font-medium text-foreground truncate mr-4">
                      {ticket.titulo}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={STATUS_COLORS[ticket.status as StatusTicket]}>
                        {STATUS_LABELS[ticket.status as StatusTicket]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

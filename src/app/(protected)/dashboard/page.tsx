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

  const isCustomer = profile.role === 'cliente'

  const baseCount = () => {
    const q = supabase.from('tickets').select('*', { count: 'exact', head: true })
    return isCustomer ? q.eq('cliente_id', user.id) : q
  }

  const recentQuery = () => {
    const q = supabase
      .from('tickets')
      .select('id, titulo, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    return isCustomer ? q.eq('cliente_id', user.id) : q
  }

  const [
    { count: total },
    { count: open },
    { count: inProgress },
    { count: resolved },
    { data: recent },
  ] = await Promise.all([
    baseCount(),
    baseCount().eq('status', 'aberto'),
    baseCount().eq('status', 'em_andamento'),
    baseCount().eq('status', 'resolvido'),
    recentQuery(),
  ])

  const metrics = [
    { label: 'Total Tickets', value: total ?? 0 },
    { label: 'Open', value: open ?? 0 },
    { label: 'In Progress', value: inProgress ?? 0 },
    { label: 'Resolved', value: resolved ?? 0 },
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
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tickets</h2>

          {!recent || recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets found.</p>
          ) : (
            <Card>
              <ul className="divide-y divide-border">
                {recent.map((ticket) => (
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
                        {new Date(ticket.created_at).toLocaleDateString('en-US')}
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

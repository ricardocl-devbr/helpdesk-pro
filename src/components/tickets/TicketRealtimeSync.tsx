'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface TicketRealtimeSyncProps {
  ticketId: string
}

export function TicketRealtimeSync({ ticketId }: TicketRealtimeSyncProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel(`ticket-sync:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('TicketRealtimeSync error:', err)
        else console.log('TicketRealtimeSync status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, router])

  return null
}

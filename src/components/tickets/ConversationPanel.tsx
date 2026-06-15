'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { MensagemComAutor, Profile } from '@/types'

interface ConversationPanelProps {
  initialMessages: MensagemComAutor[]
  ticketId: string
  currentUser: Profile
  ticketDescription: string
  ticketCustomer: Pick<Profile, 'full_name' | 'avatar_url'>
  ticketCreatedAt: string
}

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

export function ConversationPanel({
  initialMessages,
  ticketId,
  currentUser,
  ticketDescription,
  ticketCustomer,
  ticketCreatedAt,
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<MensagemComAutor[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel(`messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string
            ticket_id: string
            author_id: string
            content: string
            internal: boolean
            created_at: string
          }

          if (row.internal) return

          let autor: Profile
          if (row.author_id === currentUser.id) {
            autor = currentUser
          } else {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url, role, created_at, updated_at')
              .eq('id', row.author_id)
              .single()
            if (!data) return
            autor = data as Profile
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [...prev, { ...row, autor }]
          })
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err)
        else console.log('Realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, currentUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
            {initials(ticketCustomer.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {ticketCustomer.full_name}
            </span>
            <span className="text-xs text-gray-500">{formatDate(ticketCreatedAt)}</span>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
            {ticketDescription}
          </div>
        </div>
      </div>

      {messages.length > 0 && <Separator />}

      {messages.map((msg) => {
        const isCustomer = msg.autor.role === 'customer'
        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${isCustomer ? '' : 'flex-row-reverse'}`}
          >
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
              <AvatarImage
                src={msg.autor.avatar_url ?? undefined}
                alt={msg.autor.full_name}
              />
              <AvatarFallback
                className={`text-xs ${
                  isCustomer ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {initials(msg.autor.full_name)}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex-1 min-w-0 ${isCustomer ? '' : 'flex flex-col items-end'}`}
            >
              <div
                className={`flex items-baseline gap-2 mb-1 ${
                  isCustomer ? '' : 'flex-row-reverse'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">
                  {msg.autor.full_name}
                </span>
                <span className="text-xs text-gray-500">{formatDate(msg.created_at)}</span>
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap max-w-prose ${
                  isCustomer ? 'bg-gray-50 text-gray-700' : 'bg-indigo-50 text-indigo-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}

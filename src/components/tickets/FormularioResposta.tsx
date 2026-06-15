'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface FormularioRespostaProps {
  ticketId: string
}

export function FormularioResposta({ ticketId }: FormularioRespostaProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSending(true)
    setError(null)

    const supabase = createBrowserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('User not authenticated.')
      setSending(false)
      return
    }

    const { error: insertError } = await supabase.from('messages').insert({
      ticket_id: ticketId,
      author_id: user.id,
      content: content.trim(),
      internal: false,
    })

    if (insertError) {
      setError('Error sending reply. Please try again.')
      setSending(false)
      return
    }

    setContent('')
    setSending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        disabled={sending}
        className="resize-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={sending || !content.trim()}>
          {sending ? 'Sending...' : 'Send Reply'}
        </Button>
      </div>
    </form>
  )
}

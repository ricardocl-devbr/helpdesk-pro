'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface FormularioRespostaProps {
  ticketId: string
}

export function FormularioResposta({ ticketId }: FormularioRespostaProps) {
  const [conteudo, setConteudo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!conteudo.trim()) return

    setEnviando(true)
    setErro(null)

    const supabase = createBrowserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErro('Usuário não autenticado.')
      setEnviando(false)
      return
    }

    const { error } = await supabase.from('mensagens').insert({
      ticket_id: ticketId,
      autor_id: user.id,
      conteudo: conteudo.trim(),
      interno: false,
    })

    if (error) {
      setErro('Erro ao enviar resposta. Tente novamente.')
      setEnviando(false)
      return
    }

    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Digite sua resposta..."
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={4}
        disabled={enviando}
        className="resize-none"
      />
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={enviando || !conteudo.trim()}>
          {enviando ? 'Enviando...' : 'Enviar Resposta'}
        </Button>
      </div>
    </form>
  )
}

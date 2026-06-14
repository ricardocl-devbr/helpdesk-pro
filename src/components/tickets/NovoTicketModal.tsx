'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PRIORIDADE_LABELS } from '@/lib/constants'
import type { Categoria, PrioridadeTicket } from '@/types'

const PRIORIDADES: PrioridadeTicket[] = ['baixa', 'media', 'alta', 'urgente']

interface NovoTicketModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NovoTicketModal({ open, onClose, onSuccess }: NovoTicketModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [prioridade, setPrioridade] = useState<PrioridadeTicket>('media')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const supabase = createBrowserClient()
    supabase
      .from('categorias')
      .select('*')
      .order('nome')
      .then(({ data }) => {
        if (data) setCategorias(data)
      })
  }, [open])

  function resetForm() {
    setTitulo('')
    setDescricao('')
    setCategoriaId('')
    setPrioridade('media')
    setError(null)
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      resetForm()
      onClose()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!titulo.trim() || !descricao.trim()) {
      setError('Título e descrição são obrigatórios.')
      return
    }

    setLoading(true)

    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error: insertError } = await supabase.from('tickets').insert({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria_id: categoriaId || null,
      prioridade,
      cliente_id: user.id,
      status: 'aberto',
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    resetForm()
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="modal-titulo">Título *</Label>
            <Input
              id="modal-titulo"
              placeholder="Resumo do problema"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-descricao">Descrição *</Label>
            <Textarea
              id="modal-descricao"
              placeholder="Descreva o problema com detalhes..."
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-categoria">Categoria</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger id="modal-categoria" className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal-prioridade">Prioridade</Label>
              <Select
                value={prioridade}
                onValueChange={(v) => setPrioridade(v as PrioridadeTicket)}
              >
                <SelectTrigger id="modal-prioridade" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORIDADE_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

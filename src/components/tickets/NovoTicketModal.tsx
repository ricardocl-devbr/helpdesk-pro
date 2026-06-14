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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PRIORIDADE_LABELS } from '@/lib/constants'
import type { Categoria, PrioridadeTicket } from '@/types'

const PRIORIDADES: PrioridadeTicket[] = ['low', 'medium', 'high', 'urgent']

interface NovoTicketModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NovoTicketModal({ open, onClose, onSuccess }: NovoTicketModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [prioridade, setPrioridade] = useState<PrioridadeTicket>('medium')
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const supabase = createBrowserClient()
    supabase
      .from('categories')
      .select('*')
      .eq('ativa', true)
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [open])

  function resetForm() {
    setTitle('')
    setDescription('')
    setCategoryId('')
    setPrioridade('medium')
    setError(null)
  }

  function hasUnsavedData() {
    return title.trim() !== '' || description.trim() !== '' || categoryId !== ''
  }

  function handleClose() {
    if (hasUnsavedData()) {
      setConfirmOpen(true)
      return
    }
    resetForm()
    onClose()
  }

  function handleConfirmDiscard() {
    setConfirmOpen(false)
    resetForm()
    onClose()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) handleClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
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
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      priority: prioridade,
      customer_id: user.id,
      status: 'open',
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
    <>
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            The entered information will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirmDiscard}
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>New Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="modal-titulo">Title *</Label>
            <Input
              id="modal-titulo"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-descricao">Description *</Label>
            <Textarea
              id="modal-descricao"
              placeholder="Describe the issue in detail..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-categoria">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="modal-categoria" className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal-prioridade">Priority</Label>
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { appToast } from '@/lib/toast'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Categoria } from '@/types'

interface CategoryModalProps {
  open: boolean
  mode: 'create' | 'edit'
  category?: Categoria
  onClose: () => void
  onSuccess: () => void
}

export function CategoryModal({ open, mode, category, onClose, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && category) {
      setName(category.name)
      setColor(category.color)
      setDescription(category.description ?? '')
    } else {
      setName('')
      setColor('#6366f1')
      setDescription('')
    }
    setError(null)
  }, [open, mode, category])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()

    const payload = {
      name: name.trim(),
      color,
      description: description.trim() || null,
    }

    const { error: dbError } =
      mode === 'create'
        ? await supabase.from('categories').insert(payload)
        : await supabase.from('categories').update(payload).eq('id', category!.id)

    setLoading(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    appToast.success(mode === 'create' ? 'Category created.' : 'Category updated.')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Category' : 'Edit Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name *</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Technical Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-color">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="cat-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-16 cursor-pointer p-1"
              />
              <span className="text-sm text-muted-foreground font-mono">{color}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              placeholder="Brief description of this category..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create'
                  : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

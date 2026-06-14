'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { appToast } from '@/lib/toast'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { CategoryModal } from '@/components/categories/CategoryModal'
import type { Categoria } from '@/types'

interface CategoriasClientProps {
  categories: Categoria[]
}

export function CategoriasClient({ categories }: CategoriasClientProps) {
  const router = useRouter()
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Categoria | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)

  function handleSuccess() {
    setModalOpen(false)
    router.refresh()
  }

  function openCreate() {
    setModalMode('create')
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(category: Categoria) {
    setModalMode('edit')
    setSelected(category)
    setModalOpen(true)
  }

  async function handleToggle(category: Categoria) {
    setTogglingId(category.id)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('categories')
      .update({ ativa: !category.ativa })
      .eq('id', category.id)
    setTogglingId(null)
    if (error) {
      appToast.error(error.message)
      return
    }
    appToast.success('Category updated.')
    router.refresh()
  }

  async function handleDeleteClick(category: Categoria) {
    setCheckingId(category.id)
    const supabase = createBrowserClient()
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
    setCheckingId(null)
    if (count && count > 0) {
      appToast.error('Category has linked tickets. Deactivate it instead.')
      return
    }
    setDeleteTarget(category)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (error) {
      appToast.error(error.message)
      return
    }
    appToast.success('Category deleted.')
    router.refresh()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Category List</h2>
        <Button onClick={openCreate}>New Category</Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-muted-foreground text-sm">No categories found.</p>
          <Button variant="outline" onClick={openCreate}>
            Create first category
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-56 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <span
                      className="inline-block h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: category.color }}
                    />
                  </TableCell>
                  <TableCell className={`font-medium${!category.ativa ? ' text-muted-foreground' : ''}`}>
                    {category.name}
                    {!category.ativa && (
                      <Badge variant="secondary" className="ml-2 text-xs">inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {category.description ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          category.ativa
                            ? 'text-amber-600 hover:text-amber-600 border-amber-300 hover:border-amber-400'
                            : 'text-green-600 hover:text-green-600 border-green-300 hover:border-green-400'
                        }
                        onClick={() => handleToggle(category)}
                        disabled={togglingId === category.id || checkingId === category.id}
                      >
                        {togglingId === category.id
                          ? '...'
                          : category.ativa
                            ? 'Deactivate'
                            : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(category)}
                        disabled={checkingId === category.id || togglingId === category.id}
                      >
                        {checkingId === category.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        mode={modalMode}
        category={selected ?? undefined}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot;. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

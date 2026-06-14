'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NovoTicketModal } from '@/components/tickets/NovoTicketModal'
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORIDADE_COLORS,
  PRIORIDADE_LABELS,
} from '@/lib/constants'
import type { Profile, StatusTicket, PrioridadeTicket } from '@/types'

export interface TicketFilters {
  status: string
  prioridade: string
  categoria_id: string
  busca: string
}

export interface TicketRow {
  id: string
  numero: number
  title: string
  status: string
  priority: string
  created_at: string
  categoria: { name: string } | null
}

interface CategoryOption {
  id: string
  name: string
  color: string
  ativa: boolean
}

interface TicketsClientProps {
  tickets: TicketRow[]
  profile: Profile
  filters: TicketFilters
  categories: CategoryOption[]
}

export function TicketsClient({ tickets, profile, filters, categories }: TicketsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.busca)
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchValue(filters.busca)
  }, [filters.busca])

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  function handleSearchChange(value: string) {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateFilter('busca', value.trim())
    }, 400)
  }

  function clearFilters() {
    setSearchValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.push('?')
  }

  const activeCount = [filters.status, filters.prioridade, filters.categoria_id, filters.busca].filter(
    Boolean
  ).length

  function handleSuccess() {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Ticket List</h2>
        <Button onClick={() => setModalOpen(true)}>New Ticket</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs min-w-5 h-5 px-1.5 py-0 flex items-center justify-center">
              {activeCount}
            </Badge>
          )}
        </div>

        <Input
          placeholder="Search by title..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-8 w-52"
        />

        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => updateFilter('status', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.entries(STATUS_LABELS) as [StatusTicket, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.prioridade || 'all'}
          onValueChange={(v) => updateFilter('prioridade', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(Object.entries(PRIORIDADE_LABELS) as [PrioridadeTicket, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoria_id || 'all'}
          onValueChange={(v) => updateFilter('categoria_id', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.ativa ? cat.name : `${cat.name} (inactive)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-muted-foreground text-sm">
            {activeCount > 0 ? 'No tickets match the current filters.' : 'No tickets found.'}
          </p>
          {activeCount > 0 ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Create first ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{ticket.numero}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{ticket.title}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[ticket.status as StatusTicket]}>
                      {STATUS_LABELS[ticket.status as StatusTicket]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORIDADE_COLORS[ticket.priority as PrioridadeTicket]}>
                      {PRIORIDADE_LABELS[ticket.priority as PrioridadeTicket]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.categoria?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/tickets/${ticket.numero}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NovoTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

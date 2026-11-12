import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRightLeft, Plus, Search } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAllSucursales } from '@/features/sucursales/hooks/use-sucursales'
import { TransfersTable } from '@/features/transfers/components/TransfersTable'
import { useTransfers } from '@/features/transfers/hooks/use-transfers'
import type { EstadoTransferencia } from '@/features/transfers/types'
import { transferStatusLabel } from '@/features/transfers/utils/transfer-status'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

const ESTADOS: EstadoTransferencia[] = ['BORRADOR', 'CONFIRMADA', 'CANCELADA']

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function parseId(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function parseEstado(value: string | null): EstadoTransferencia | undefined {
  if (!value) return undefined
  return ESTADOS.includes(value as EstadoTransferencia)
    ? (value as EstadoTransferencia)
    : undefined
}

export function TransfersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))
  const origenFromUrl = parseId(searchParams.get('origen'))
  const destinoFromUrl = parseId(searchParams.get('destino'))
  const estadoFromUrl = parseEstado(searchParams.get('estado'))

  const [searchInput, setSearchInput] = useState(qFromUrl)
  const [urlQ, setUrlQ] = useState(qFromUrl)

  if (qFromUrl !== urlQ) {
    setUrlQ(qFromUrl)
    setSearchInput(qFromUrl)
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === qFromUrl) return
      const params = new URLSearchParams(searchParams)
      if (next) params.set('q', next)
      else params.delete('q')
      params.delete('page')
      setSearchParams(params, { replace: true })
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput, qFromUrl, searchParams, setSearchParams])

  const params = useMemo(
    () => ({
      q: qFromUrl || undefined,
      sucursalOrigenId: origenFromUrl,
      sucursalDestinoId: destinoFromUrl,
      estado: estadoFromUrl,
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [qFromUrl, origenFromUrl, destinoFromUrl, estadoFromUrl, pageFromUrl],
  )

  const transfersQuery = useTransfers(params)
  const sucursalesQuery = useAllSucursales()
  const sucursales = sucursalesQuery.data ?? []

  const transfers = transfersQuery.data?.data ?? []
  const metadata = transfersQuery.data?.metadata
  const hasFilters =
    Boolean(qFromUrl) ||
    origenFromUrl != null ||
    destinoFromUrl != null ||
    estadoFromUrl != null
  const isEmpty = !transfersQuery.isLoading && transfers.length === 0 && !hasFilters
  const isFilteredEmpty =
    !transfersQuery.isLoading && transfers.length === 0 && hasFilters

  function updateParams(updater: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    updater(next)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 max-w-2xl text-sm text-muted">
          Mové stock entre sucursales. Los borradores no afectan inventario hasta confirmarlos.
        </p>
        <Link
          to="/transferencias/nueva"
          className={cn(buttonVariants(), 'inline-flex shrink-0')}
        >
          <Plus className="size-4" aria-hidden />
          Nueva transferencia
        </Link>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1 xl:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por número o producto"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar transferencias"
            />
          </div>

          <div className="flex w-full items-center gap-2.5 text-sm xl:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap">Origen</span>
            <Select
              value={origenFromUrl != null ? String(origenFromUrl) : 'all'}
              onValueChange={(value) => {
                updateParams((next) => {
                  if (value !== 'all') next.set('origen', value)
                  else next.delete('origen')
                  next.delete('page')
                })
              }}
              disabled={sucursalesQuery.isLoading}
            >
              <SelectTrigger className="w-full xl:w-44" aria-label="Filtrar por origen">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {sucursales.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full items-center gap-2.5 text-sm xl:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap">Destino</span>
            <Select
              value={destinoFromUrl != null ? String(destinoFromUrl) : 'all'}
              onValueChange={(value) => {
                updateParams((next) => {
                  if (value !== 'all') next.set('destino', value)
                  else next.delete('destino')
                  next.delete('page')
                })
              }}
              disabled={sucursalesQuery.isLoading}
            >
              <SelectTrigger className="w-full xl:w-44" aria-label="Filtrar por destino">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {sucursales.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full items-center gap-2.5 text-sm xl:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap">Estado</span>
            <Select
              value={estadoFromUrl ?? 'all'}
              onValueChange={(value) => {
                updateParams((next) => {
                  if (value !== 'all') next.set('estado', value)
                  else next.delete('estado')
                  next.delete('page')
                })
              }}
            >
              <SelectTrigger className="w-full xl:w-40" aria-label="Filtrar por estado">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {transferStatusLabel(estado)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {transfersQuery.isLoading ? <TableSkeleton columns={6} /> : null}

      {transfersQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">
            No se pudieron cargar las transferencias
          </p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(transfersQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void transfersQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!transfersQuery.isLoading && !transfersQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={ArrowRightLeft}
            title="Todavía no hay transferencias"
            description="Creá un borrador para mover stock entre sucursales."
            action={
              <Link to="/transferencias/nueva" className={cn(buttonVariants(), 'inline-flex')}>
                <Plus className="size-4" aria-hidden />
                Nueva transferencia
              </Link>
            }
          />
        </Card>
      ) : null}

      {!transfersQuery.isLoading && !transfersQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos transferencias con esos filtros."
          />
        </Card>
      ) : null}

      {!transfersQuery.isLoading && !transfersQuery.isError && transfers.length > 0 ? (
        <div className="flex flex-col gap-4">
          <TransfersTable transfers={transfers} />
          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'transferencia', plural: 'transferencias' }}
              disabled={transfersQuery.isFetching}
              onPageChange={(page) => {
                updateParams((next) => {
                  if (page <= 1) next.delete('page')
                  else next.set('page', String(page))
                })
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

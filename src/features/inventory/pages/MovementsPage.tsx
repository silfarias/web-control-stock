import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { History, Search } from 'lucide-react'
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
import { MovementsTable } from '@/features/inventory/components/MovementsTable'
import { useStockMovements } from '@/features/inventory/hooks/use-stock-movements'
import type { TipoMovimientoStock } from '@/features/inventory/types'
import { movementTypeLabel } from '@/features/inventory/utils/movement-labels'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'

const MOVEMENT_TYPES: TipoMovimientoStock[] = [
  'COMPRA',
  'VENTA',
  'AJUSTE_ENTRADA',
  'AJUSTE_SALIDA',
]

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function parseTipo(value: string | null): TipoMovimientoStock | undefined {
  if (!value) return undefined
  return MOVEMENT_TYPES.includes(value as TipoMovimientoStock)
    ? (value as TipoMovimientoStock)
    : undefined
}

export function MovementsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))
  const tipoFromUrl = parseTipo(searchParams.get('tipo'))

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
      tipo: tipoFromUrl,
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [qFromUrl, tipoFromUrl, pageFromUrl],
  )

  const movementsQuery = useStockMovements(params)
  const movements = movementsQuery.data?.data ?? []
  const metadata = movementsQuery.data?.metadata

  const hasFilters = Boolean(qFromUrl) || tipoFromUrl != null
  const isEmpty = !movementsQuery.isLoading && movements.length === 0 && !hasFilters
  const isFilteredEmpty = !movementsQuery.isLoading && movements.length === 0 && hasFilters

  function updateParams(updater: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    updater(next)
    setSearchParams(next, { replace: true })
  }

  function setPage(page: number) {
    updateParams((next) => {
      if (page <= 1) next.delete('page')
      else next.set('page', String(page))
    })
  }

  function handleTipoChange(value: string) {
    updateParams((next) => {
      if (value) next.set('tipo', value)
      else next.delete('tipo')
      next.delete('page')
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <p className="text-sm text-muted">Historial de entradas y salidas de stock.</p>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por producto, código o motivo"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar movimientos"
            />
          </div>
          <div className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">Tipo</span>
            <Select
              value={tipoFromUrl ?? 'all'}
              onValueChange={(value) => handleTipoChange(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full lg:w-52" aria-label="Filtrar por tipo de movimiento">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {MOVEMENT_TYPES.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {movementTypeLabel(tipo)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {movementsQuery.isLoading ? <TableSkeleton columns={5} /> : null}

      {movementsQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudieron cargar los movimientos</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(movementsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void movementsQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!movementsQuery.isLoading && !movementsQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={History}
            title="Todavía no hay movimientos"
            description="Cuando se registren compras, ventas o ajustes, van a aparecer en este historial."
          />
        </Card>
      ) : null}

      {!movementsQuery.isLoading && !movementsQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos movimientos que coincidan con los filtros aplicados."
          />
        </Card>
      ) : null}

      {!movementsQuery.isLoading && !movementsQuery.isError && movements.length > 0 ? (
        <div className="flex flex-col gap-4">
          <MovementsTable movements={movements} />

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'movimiento', plural: 'movimientos' }}
              disabled={movementsQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

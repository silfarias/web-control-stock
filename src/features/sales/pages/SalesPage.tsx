import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Search, ShoppingBag, X } from 'lucide-react'
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
import {
  addLocalDays,
  toLocalIsoDate,
} from '@/features/dashboard/utils/dashboard-dates'
import { SalesTable } from '@/features/sales/components/SalesTable'
import { useSales } from '@/features/sales/hooks/use-sales'
import type { EstadoVenta, MetodoPago } from '@/features/sales/types'
import {
  PAYMENT_METHODS,
  SALE_STATUSES,
  paymentMethodLabel,
  saleStatusLabel,
} from '@/features/sales/utils/sale-labels'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { formatShortDate } from '@/lib/utils/format'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function parseEstado(value: string | null): EstadoVenta | undefined {
  if (!value) return undefined
  return SALE_STATUSES.includes(value as EstadoVenta) ? (value as EstadoVenta) : undefined
}

function parseMetodo(value: string | null): MetodoPago | undefined {
  if (!value) return undefined
  return PAYMENT_METHODS.includes(value as MetodoPago) ? (value as MetodoPago) : undefined
}

/** Solo acepta YYYY-MM-DD de calendario (sin conversión UTC). */
function parseFecha(value: string | null): string | undefined {
  if (!value || !ISO_DATE_RE.test(value)) return undefined
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return undefined
  }
  return value
}

export function SalesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))
  const estadoFromUrl = parseEstado(searchParams.get('estado'))
  const metodoFromUrl = parseMetodo(searchParams.get('metodoPago'))
  const fechaFromUrl = parseFecha(searchParams.get('fecha'))
  const todayIso = toLocalIsoDate()
  const yesterdayIso = addLocalDays(todayIso, -1)

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
      estado: estadoFromUrl,
      metodoPago: metodoFromUrl,
      fecha: fechaFromUrl,
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [qFromUrl, estadoFromUrl, metodoFromUrl, fechaFromUrl, pageFromUrl],
  )

  const salesQuery = useSales(params)
  const sales = salesQuery.data?.data ?? []
  const metadata = salesQuery.data?.metadata

  const hasFilters =
    Boolean(qFromUrl) ||
    estadoFromUrl != null ||
    metodoFromUrl != null ||
    fechaFromUrl != null
  const isEmpty = !salesQuery.isLoading && sales.length === 0 && !hasFilters
  const isFilteredEmpty = !salesQuery.isLoading && sales.length === 0 && hasFilters

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

  function setFecha(value: string | undefined) {
    updateParams((next) => {
      if (value) next.set('fecha', value)
      else next.delete('fecha')
      next.delete('page')
    })
  }

  function clearFilters() {
    setSearchInput('')
    updateParams((next) => {
      next.delete('q')
      next.delete('estado')
      next.delete('metodoPago')
      next.delete('fecha')
      next.delete('page')
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Consultá el historial y registrá ventas. En efectivo se requiere una caja abierta.
      </p>

      <Card className="p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:basis-[18rem]">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar ventas"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar ventas"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:min-w-0 sm:flex-1 sm:flex-wrap sm:items-center lg:contents">
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
              <SelectTrigger
                className="w-full shrink-0 lg:w-[9.75rem]"
                aria-label="Filtrar por estado"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {SALE_STATUSES.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {saleStatusLabel(estado)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={metodoFromUrl ?? 'all'}
              onValueChange={(value) => {
                updateParams((next) => {
                  if (value !== 'all') next.set('metodoPago', value)
                  else next.delete('metodoPago')
                  next.delete('page')
                })
              }}
            >
              <SelectTrigger
                className="w-full shrink-0 lg:w-[11.5rem]"
                aria-label="Filtrar por método de pago"
              >
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {paymentMethodLabel(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="col-span-2 flex min-w-0 items-center sm:col-span-1 sm:min-w-[17.5rem] lg:min-w-0">
              <div className="flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-border bg-surface">
                <input
                  type="date"
                  aria-label="Filtrar por fecha"
                  max={todayIso}
                  value={fechaFromUrl ?? ''}
                  onChange={(event) => {
                    const value = event.target.value
                    setFecha(parseFecha(value) ?? undefined)
                  }}
                  className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-foreground outline-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setFecha(todayIso)}
                  className="shrink-0 border-l border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setFecha(yesterdayIso)}
                  className="shrink-0 border-l border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  Ayer
                </button>
              </div>
            </div>

            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                className="col-span-2 h-11 shrink-0 px-3 sm:col-span-1 sm:ml-auto lg:ml-0"
                onClick={clearFilters}
                aria-label="Limpiar filtros"
              >
                <X className="size-4" aria-hidden />
                Limpiar
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {salesQuery.isLoading ? <TableSkeleton columns={6} /> : null}

      {salesQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudieron cargar las ventas</p>
          <p className="mt-1 text-sm text-error-ink/90">{getApiErrorMessage(salesQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void salesQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!salesQuery.isLoading && !salesQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={ShoppingBag}
            title="Todavía no hay ventas"
            description="Cuando registres ventas, van a aparecer en este listado."
          />
        </Card>
      ) : null}

      {!salesQuery.isLoading && !salesQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description={
              fechaFromUrl
                ? `No hay ventas el ${formatShortDate(fechaFromUrl)} con los filtros aplicados.`
                : 'No encontramos ventas que coincidan con los filtros aplicados.'
            }
          />
        </Card>
      ) : null}

      {!salesQuery.isLoading && !salesQuery.isError && sales.length > 0 ? (
        <div className="flex flex-col gap-4">
          <SalesTable sales={sales} />

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'venta', plural: 'ventas' }}
              disabled={salesQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

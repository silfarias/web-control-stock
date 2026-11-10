import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Search, ShoppingBag } from 'lucide-react'
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

export function SalesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))
  const estadoFromUrl = parseEstado(searchParams.get('estado'))
  const metodoFromUrl = parseMetodo(searchParams.get('metodoPago'))

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
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [qFromUrl, estadoFromUrl, metodoFromUrl, pageFromUrl],
  )

  const salesQuery = useSales(params)
  const sales = salesQuery.data?.data ?? []
  const metadata = salesQuery.data?.metadata

  const hasFilters =
    Boolean(qFromUrl) || estadoFromUrl != null || metodoFromUrl != null
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

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Consultá el historial y registrá ventas. En efectivo se requiere una caja abierta.
      </p>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar ventas"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar ventas"
            />
          </div>

          <div className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">Estado</span>
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
              <SelectTrigger className="w-full lg:w-44" aria-label="Filtrar por estado">
                <SelectValue placeholder="Todos los estados" />
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
          </div>

          <div className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">
              Método de pago
            </span>
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
              <SelectTrigger className="w-full lg:w-48" aria-label="Filtrar por método de pago">
                <SelectValue placeholder="Todos los métodos" />
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
            description="No encontramos ventas que coincidan con los filtros aplicados."
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

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ClipboardList, Search } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { PurchasesTable } from '@/features/purchases/components/PurchasesTable'
import { usePurchases } from '@/features/purchases/hooks/use-purchases'
import type { EstadoCompra } from '@/features/purchases/types'
import { purchaseStatusLabel } from '@/features/purchases/utils/purchase-status'
import { useSupplierOptions } from '@/features/suppliers/hooks/use-supplier-options'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

const ESTADOS: EstadoCompra[] = ['BORRADOR', 'CONFIRMADA', 'CANCELADA']

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function parseProveedorId(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function parseEstado(value: string | null): EstadoCompra | undefined {
  if (!value) return undefined
  return ESTADOS.includes(value as EstadoCompra) ? (value as EstadoCompra) : undefined
}

export function PurchasesPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))
  const proveedorIdFromUrl = parseProveedorId(searchParams.get('proveedorId'))
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
      proveedorId: proveedorIdFromUrl,
      estado: estadoFromUrl,
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [qFromUrl, proveedorIdFromUrl, estadoFromUrl, pageFromUrl],
  )

  const purchasesQuery = usePurchases(params)
  const suppliersQuery = useSupplierOptions()
  const suppliers = suppliersQuery.data ?? []

  const purchases = purchasesQuery.data?.data ?? []
  const metadata = purchasesQuery.data?.metadata

  const hasFilters =
    Boolean(qFromUrl) || proveedorIdFromUrl != null || estadoFromUrl != null
  const isEmpty = !purchasesQuery.isLoading && purchases.length === 0 && !hasFilters
  const isFilteredEmpty =
    !purchasesQuery.isLoading && purchases.length === 0 && hasFilters

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
        Consultá el historial, armá borradores y confirmá el ingreso de mercadería desde el
        detalle de cada compra.
      </p>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por proveedor o producto"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar compras"
            />
          </div>

          <label className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">
              Proveedor
            </span>
            <select
              value={proveedorIdFromUrl ?? ''}
              onChange={(event) => {
                updateParams((next) => {
                  if (event.target.value) next.set('proveedorId', event.target.value)
                  else next.delete('proveedorId')
                  next.delete('page')
                })
              }}
              disabled={suppliersQuery.isLoading}
              className={cn(
                'h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors lg:w-52',
                'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
              aria-label="Filtrar por proveedor"
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">Estado</span>
            <select
              value={estadoFromUrl ?? ''}
              onChange={(event) => {
                updateParams((next) => {
                  if (event.target.value) next.set('estado', event.target.value)
                  else next.delete('estado')
                  next.delete('page')
                })
              }}
              className={cn(
                'h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors lg:w-44',
                'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
              )}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {purchaseStatusLabel(estado)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {purchasesQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando compras…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {purchasesQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudieron cargar las compras</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(purchasesQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void purchasesQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!purchasesQuery.isLoading && !purchasesQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Todavía no hay compras"
            description="Cuando se registren compras, van a aparecer en este listado."
          />
        </Card>
      ) : null}

      {!purchasesQuery.isLoading && !purchasesQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos compras que coincidan con los filtros aplicados."
          />
        </Card>
      ) : null}

      {!purchasesQuery.isLoading && !purchasesQuery.isError && purchases.length > 0 ? (
        <div className="flex flex-col gap-4">
          <PurchasesTable purchases={purchases} canManage={canManage} />

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'compra', plural: 'compras' }}
              disabled={purchasesQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

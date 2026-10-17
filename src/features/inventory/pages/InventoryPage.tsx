import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { History, Search, Warehouse } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { InventoryTable } from '@/features/inventory/components/InventoryTable'
import { StockAdjustmentDialog } from '@/features/inventory/components/StockAdjustmentDialog'
import { useInventory } from '@/features/inventory/hooks/use-inventory'
import type { Stock } from '@/features/inventory/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function InventoryPage() {
  const { user } = useAuth()
  const canAdjust = user?.role === 'ADMIN'
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))

  const [searchInput, setSearchInput] = useState(qFromUrl)
  const [urlQ, setUrlQ] = useState(qFromUrl)
  const [adjusting, setAdjusting] = useState<Stock | null>(null)

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
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [qFromUrl, pageFromUrl],
  )

  const inventoryQuery = useInventory(params)
  const items = inventoryQuery.data?.data ?? []
  const metadata = inventoryQuery.data?.metadata

  const hasFilters = Boolean(qFromUrl)
  const isEmpty = !inventoryQuery.isLoading && items.length === 0 && !hasFilters
  const isFilteredEmpty = !inventoryQuery.isLoading && items.length === 0 && hasFilters

  function setPage(page: number) {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-[1.75rem] leading-9 font-semibold tracking-tight">Inventario</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Consultá las existencias actuales, el historial de movimientos y registrá ajustes
            manuales cuando sea necesario.
          </p>
        </div>
        <Link
          to="/inventario/movimientos"
          className={cn(buttonVariants({ variant: 'outline' }), 'shrink-0')}
        >
          <History className="size-4" aria-hidden />
          Movimientos recientes
        </Link>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="max-w-md">
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por nombre, código o código de barras"
            leadingIcon={<Search className="size-4" aria-hidden />}
            aria-label="Buscar en inventario"
          />
        </div>
      </Card>

      {inventoryQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando inventario…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {inventoryQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar el inventario</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(inventoryQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void inventoryQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!inventoryQuery.isLoading && !inventoryQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={Warehouse}
            title="Todavía no hay registros de stock"
            description="Cuando existan productos con inventario, las existencias van a aparecer acá."
          />
        </Card>
      ) : null}

      {!inventoryQuery.isLoading && !inventoryQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description={`No encontramos stock que coincida con “${qFromUrl}”.`}
          />
        </Card>
      ) : null}

      {!inventoryQuery.isLoading && !inventoryQuery.isError && items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {!hasFilters && metadata ? (
            <p className="text-sm text-muted">
              {metadata.count}{' '}
              {metadata.count === 1
                ? 'producto con registro de stock'
                : 'productos con registro de stock'}
            </p>
          ) : null}

          <InventoryTable
            items={items}
            canAdjust={canAdjust}
            onAdjust={setAdjusting}
          />

          {metadata && metadata.totalPages > 1 ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={hasFilters ? metadata.count : undefined}
              itemLabel={
                hasFilters ? { singular: 'resultado', plural: 'resultados' } : undefined
              }
              disabled={inventoryQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : null}

      <StockAdjustmentDialog
        open={Boolean(adjusting)}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null)
        }}
        product={
          adjusting?.producto
            ? {
                id: adjusting.producto.id,
                nombre: adjusting.producto.nombre,
                codigo: adjusting.producto.codigo,
              }
            : null
        }
        currentStock={adjusting?.cantidad ?? null}
      />
    </div>
  )
}

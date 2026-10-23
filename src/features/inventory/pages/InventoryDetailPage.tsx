import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Package, SlidersHorizontal, Warehouse } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { MovementsTable } from '@/features/inventory/components/MovementsTable'
import { StockAdjustmentDialog } from '@/features/inventory/components/StockAdjustmentDialog'
import { StockStatusBadge } from '@/features/inventory/components/StockStatusBadge'
import { useProductStockRecord } from '@/features/inventory/hooks/use-product-stock'
import { useProductMovements } from '@/features/inventory/hooks/use-stock-movements'
import { getStockStatus } from '@/features/inventory/utils/stock-status'
import { useProduct } from '@/features/products/hooks/use-product'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function InventoryDetailPage() {
  const { productoId: idParam } = useParams()
  const productId = parseId(idParam)
  const { user } = useAuth()
  const canAdjust = user?.role === 'ADMIN'
  const [movementsPage, setMovementsPage] = useState(1)
  const [adjustOpen, setAdjustOpen] = useState(false)

  const productQuery = useProduct(productId)
  const stockQuery = useProductStockRecord(productId)

  const movementsParams = useMemo(
    () => ({
      pageNumber: movementsPage,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [movementsPage],
  )

  const movementsQuery = useProductMovements(productId, movementsParams)

  if (productId == null) {
    return (
      <Card>
        <EmptyState
          icon={Warehouse}
          title="Producto no válido"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/inventario"
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver al inventario
            </Link>
          }
        />
      </Card>
    )
  }

  const product = stockQuery.data?.producto ?? productQuery.data
  const cantidad = stockQuery.data?.cantidad
  const stockMissing = !stockQuery.isLoading && !stockQuery.isError && stockQuery.data === null
  const status = getStockStatus(stockMissing ? null : cantidad, product?.minimoStock ?? 0)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/inventario"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Inventario
          </Link>
          <h2 className="mt-2 text-lg leading-snug font-semibold tracking-tight">
            {productQuery.isLoading && stockQuery.isLoading
              ? 'Cargando…'
              : (product?.nombre ?? 'Detalle de inventario')}
          </h2>
          {product ? (
            <p className="mt-2 text-sm text-muted">
              Código <span className="font-mono text-foreground">{product.codigo}</span>
              {product.categoria?.nombre ? (
                <>
                  {' '}
                  · {product.categoria.nombre}
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        {canAdjust && product && !stockQuery.isLoading ? (
          <Button
            type="button"
            className="shrink-0"
            onClick={() => setAdjustOpen(true)}
            disabled={stockQuery.isError}
            title={
              stockQuery.isError
                ? 'No se puede ajustar sin conocer el stock actual'
                : undefined
            }
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Ajustar stock
          </Button>
        ) : null}
      </div>

      {(productQuery.isLoading && stockQuery.isLoading) ||
      (stockQuery.isLoading && !product) ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando inventario…</p>
          <p className="mt-1 text-sm text-muted">Consultando existencias y movimientos.</p>
        </Card>
      ) : null}

      {productQuery.isError && stockQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar el inventario</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(stockQuery.error ?? productQuery.error)}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/inventario"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver
            </Link>
            <Button
              type="button"
              onClick={() => {
                void productQuery.refetch()
                void stockQuery.refetch()
              }}
            >
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {product && !stockQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs tracking-wide text-muted uppercase">Stock actual</p>
            {stockQuery.isError ? (
              <p className="mt-2 text-sm text-warning-ink">No se pudo obtener la cantidad</p>
            ) : stockMissing ? (
              <p className="mt-2 text-sm text-muted">Sin registro de stock</p>
            ) : (
              <p
                className={cn(
                  'mt-2 text-2xl font-semibold tabular-nums tracking-tight',
                  status === 'out' && 'text-error-ink',
                  status === 'low' && 'text-warning-ink',
                )}
              >
                {cantidad}
              </p>
            )}
          </Card>
          <Card className="p-5">
            <p className="text-xs tracking-wide text-muted uppercase">Stock mínimo</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {product.minimoStock}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs tracking-wide text-muted uppercase">Estado</p>
            <div className="mt-3">
              <StockStatusBadge status={status} />
            </div>
          </Card>
        </div>
      ) : null}

      {product ? (
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/productos/${product.id}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            <Package className="size-4" aria-hidden />
            Ver ficha del producto
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Historial de movimientos</h3>
          <p className="mt-1 text-sm text-muted">
            Registro inmutable de entradas y salidas asociadas a este producto.
          </p>
        </div>

        {movementsQuery.isLoading ? (
          <Card className="px-6 py-12 text-center">
            <p className="text-sm font-medium">Cargando movimientos…</p>
          </Card>
        ) : null}

        {movementsQuery.isError ? (
          <Card className="border-error/20 bg-error-soft px-6 py-8 text-center">
            <p className="text-sm font-semibold text-error-ink">No se pudo cargar el historial</p>
            <p className="mt-1 text-sm text-error-ink/90">
              {getApiErrorMessage(movementsQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 bg-surface"
              onClick={() => void movementsQuery.refetch()}
            >
              Reintentar
            </Button>
          </Card>
        ) : null}

        {!movementsQuery.isLoading &&
        !movementsQuery.isError &&
        (movementsQuery.data?.data.length ?? 0) === 0 ? (
          <Card>
            <EmptyState
              icon={Warehouse}
              title="Sin movimientos"
              description="Todavía no hay movimientos registrados para este producto."
            />
          </Card>
        ) : null}

        {!movementsQuery.isLoading &&
        !movementsQuery.isError &&
        (movementsQuery.data?.data.length ?? 0) > 0 ? (
          <>
            <MovementsTable movements={movementsQuery.data!.data} hideProduct />
            <ListPagination
              pageNumber={movementsQuery.data!.metadata.pageNumber}
              totalPages={movementsQuery.data!.metadata.totalPages}
              count={movementsQuery.data!.metadata.count}
              itemLabel={{ singular: 'movimiento', plural: 'movimientos' }}
              disabled={movementsQuery.isFetching}
              onPageChange={setMovementsPage}
            />
          </>
        ) : null}
      </div>

      {product ? (
        <StockAdjustmentDialog
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          product={{
            id: product.id,
            nombre: product.nombre,
            codigo: product.codigo,
          }}
          currentStock={stockMissing ? null : (cantidad ?? null)}
          stockUnavailable={stockQuery.isError}
        />
      ) : null}
    </div>
  )
}

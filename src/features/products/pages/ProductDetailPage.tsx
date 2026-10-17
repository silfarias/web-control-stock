import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Package, Pencil, Trash2, Warehouse } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/common/use-toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ProductStockCell } from '@/features/products/components/ProductStockCell'
import { useProduct } from '@/features/products/hooks/use-product'
import { useDeleteProduct } from '@/features/products/hooks/use-product-mutations'
import { useProductStock } from '@/features/products/hooks/use-product-stocks'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatMoney, formatShortDate } from '@/lib/utils/format'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function ProductDetailPage() {
  const { id: idParam } = useParams()
  const productId = parseId(idParam)
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'
  const { pushToast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const productQuery = useProduct(productId)
  const stockQuery = useProductStock(productId)
  const deleteMutation = useDeleteProduct()

  const product = productQuery.data

  async function handleDelete() {
    if (!product) return
    try {
      await deleteMutation.mutateAsync(product.id)
      pushToast({
        tone: 'success',
        title: 'Producto eliminado',
        description: `"${product.nombre}" ya no aparece en los listados operativos.`,
      })
      setConfirmOpen(false)
      void navigate('/productos')
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo eliminar',
        description: getApiErrorMessage(error),
      })
    }
  }

  if (productId == null) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="Producto no válido"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/productos"
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver al listado
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/productos"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Productos
          </Link>
          <h2 className="mt-3 text-[1.75rem] leading-9 font-semibold tracking-tight">
            {productQuery.isLoading ? 'Cargando…' : (product?.nombre ?? 'Detalle de producto')}
          </h2>
          {product ? (
            <p className="mt-2 text-sm text-muted">
              Código <span className="font-mono text-foreground">{product.codigo}</span>
            </p>
          ) : null}
        </div>

        {canManage && product ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to={`/productos/${product.id}/editar`}
              className={buttonVariants({ variant: 'outline' })}
            >
              <Pencil className="size-4" aria-hidden />
              Editar
            </Link>
            <Button
              type="button"
              variant="outline"
              className="border-error/30 text-error-ink hover:bg-error-soft"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar
            </Button>
          </div>
        ) : null}
      </div>

      {productQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando producto…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {productQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar el producto</p>
          <p className="mt-1 text-sm text-error-ink/90">{getApiErrorMessage(productQuery.error)}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/productos"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void productQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!productQuery.isLoading && !productQuery.isError && product ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-tight">Información general</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Nombre</dt>
                <dd className="mt-1 text-sm font-medium">{product.nombre}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Categoría</dt>
                <dd className="mt-1 text-sm">{product.categoria?.nombre ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Código interno</dt>
                <dd className="mt-1 font-mono text-sm">{product.codigo}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Código de barras</dt>
                <dd className="mt-1 font-mono text-sm">{product.codigoBarras}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs tracking-wide text-muted uppercase">Descripción</dt>
                <dd className="mt-1 text-sm text-muted">
                  {product.descripcion?.trim() ? product.descripcion : 'Sin descripción'}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Creado</dt>
                <dd className="mt-1 text-sm tabular-nums">{formatShortDate(product.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Actualizado</dt>
                <dd className="mt-1 text-sm tabular-nums">{formatShortDate(product.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold tracking-tight">Precios</h3>
              <dl className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">Venta</dt>
                  <dd className="text-base font-semibold tabular-nums">
                    {formatMoney(product.precioVenta)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">Costo</dt>
                  <dd className="text-sm tabular-nums text-muted">
                    {formatMoney(product.precioCosto)}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight">Stock</h3>
                <Badge tone="neutral">Solo lectura</Badge>
              </div>
              <div className="mt-4">
                <ProductStockCell
                  cantidad={stockQuery.data}
                  minimoStock={product.minimoStock}
                  loading={stockQuery.isLoading}
                />
              </div>
              <p className="mt-3 text-xs text-muted">
                Mínimo configurado: <span className="tabular-nums">{product.minimoStock}</span>
              </p>
              {stockQuery.isError ? (
                <p className="mt-2 text-xs text-warning-ink">{getApiErrorMessage(stockQuery.error)}</p>
              ) : null}
              <Link
                to={`/inventario/${product.id}`}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'mt-4 w-full justify-center',
                )}
              >
                <Warehouse className="size-4" aria-hidden />
                Ver inventario y movimientos
              </Link>
            </Card>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar producto"
        description={
          product
            ? `Se va a dar de baja “${product.nombre}”. Dejará de aparecer en los listados.`
            : ''
        }
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}

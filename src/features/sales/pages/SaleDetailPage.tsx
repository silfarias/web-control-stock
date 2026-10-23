import { Link, useParams } from 'react-router'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { SaleItemsTable } from '@/features/sales/components/SaleItemsTable'
import { SaleStatusBadge } from '@/features/sales/components/SaleStatusBadge'
import { useSale } from '@/features/sales/hooks/use-sales'
import { paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatMoney } from '@/lib/utils/format'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function SaleDetailPage() {
  const { id: idParam } = useParams()
  const saleId = parseId(idParam)
  const saleQuery = useSale(saleId)
  const sale = saleQuery.data

  if (saleId == null) {
    return (
      <Card>
        <EmptyState
          icon={ShoppingBag}
          title="Venta no válida"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/ventas"
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
      <div className="min-w-0">
        <Link
          to="/ventas"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ventas
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-lg leading-snug font-semibold tracking-tight">
            {saleQuery.isLoading ? 'Cargando…' : `Venta #${saleId}`}
          </h2>
          {sale ? <SaleStatusBadge estado={sale.estado} /> : null}
        </div>
        {sale ? (
          <p className="mt-2 text-sm text-muted">
            Registrada el {formatDateTime(sale.createdAt)}
            {sale.usuario?.nombre ? ` · por ${sale.usuario.nombre}` : null}
          </p>
        ) : null}
      </div>

      {saleQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando venta…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {saleQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar la venta</p>
          <p className="mt-1 text-sm text-error-ink/90">{getApiErrorMessage(saleQuery.error)}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/ventas"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void saleQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!saleQuery.isLoading && !saleQuery.isError && sale ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold tracking-tight">Información general</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Método de pago</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {paymentMethodLabel(sale.metodoPago)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Estado</dt>
                  <dd className="mt-1">
                    <SaleStatusBadge estado={sale.estado} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Fecha</dt>
                  <dd className="mt-1 text-sm tabular-nums">{formatDateTime(sale.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Registrada por</dt>
                  <dd className="mt-1 text-sm">{sale.usuario?.nombre ?? '—'}</dd>
                  {sale.usuario?.email ? (
                    <dd className="mt-0.5 text-xs text-muted">{sale.usuario.email}</dd>
                  ) : null}
                </div>
              </dl>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold tracking-tight">Resumen</h3>
              <dl className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">Ítems</dt>
                  <dd className="text-sm tabular-nums font-medium">
                    {sale.items?.length ?? 0}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
                  <dt className="text-sm text-muted">Total</dt>
                  <dd className="text-xl font-semibold tabular-nums tracking-tight">
                    {formatMoney(sale.total)}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Productos vendidos</h3>
              <p className="mt-1 text-sm text-muted">
                Precios unitarios y subtotales de la venta.
              </p>
            </div>

            {(sale.items?.length ?? 0) === 0 ? (
              <Card>
                <EmptyState
                  icon={ShoppingBag}
                  title="Sin ítems"
                  description="Esta venta no tiene productos asociados."
                />
              </Card>
            ) : (
              <SaleItemsTable items={sale.items} />
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

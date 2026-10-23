import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { PurchaseDetailActions } from '@/features/purchases/components/PurchaseDetailActions'
import { PurchaseItemsTable } from '@/features/purchases/components/PurchaseItemsTable'
import { PurchaseStatusBadge } from '@/features/purchases/components/PurchaseStatusBadge'
import { usePurchase } from '@/features/purchases/hooks/use-purchases'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatMoney } from '@/lib/utils/format'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function PurchaseDetailPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const { id: idParam } = useParams()
  const purchaseId = parseId(idParam)
  const purchaseQuery = usePurchase(purchaseId)
  const purchase = purchaseQuery.data

  if (purchaseId == null) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardList}
          title="Compra no válida"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/compras"
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
          to="/compras"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Compras
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg leading-snug font-semibold tracking-tight">
                {purchaseQuery.isLoading ? 'Cargando…' : `Compra #${purchaseId}`}
              </h2>
              {purchase ? <PurchaseStatusBadge estado={purchase.estado} /> : null}
            </div>
            {purchase ? (
              <p className="mt-2 text-sm text-muted">
                Registrada el {formatDateTime(purchase.createdAt)}
                {purchase.usuario?.nombre ? ` · por ${purchase.usuario.nombre}` : null}
              </p>
            ) : null}
          </div>

          {purchase ? (
            <div className="flex min-w-0 flex-col gap-2 lg:items-end">
              <PurchaseDetailActions
                purchase={purchase}
                isAdmin={isAdmin}
                onDeleted={() => void navigate('/compras')}
                onActionError={() => void purchaseQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </div>

      {purchaseQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando compra…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {purchaseQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar la compra</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(purchaseQuery.error)}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/compras"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void purchaseQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!purchaseQuery.isLoading && !purchaseQuery.isError && purchase ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold tracking-tight">Información general</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Proveedor</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {purchase.proveedor?.nombre ?? '—'}
                  </dd>
                  {purchase.proveedor?.cuit ? (
                    <dd className="mt-0.5 font-mono text-xs text-muted">
                      CUIT {purchase.proveedor.cuit}
                    </dd>
                  ) : null}
                  {purchase.proveedor && purchase.proveedor.activo === false ? (
                    <dd className="mt-1 text-xs text-warning-ink">Proveedor inactivo</dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Estado</dt>
                  <dd className="mt-1">
                    <PurchaseStatusBadge estado={purchase.estado} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Fecha</dt>
                  <dd className="mt-1 text-sm tabular-nums">
                    {formatDateTime(purchase.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Registrada por</dt>
                  <dd className="mt-1 text-sm">{purchase.usuario?.nombre ?? '—'}</dd>
                  {purchase.usuario?.email ? (
                    <dd className="mt-0.5 text-xs text-muted">{purchase.usuario.email}</dd>
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
                    {purchase.items?.length ?? 0}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
                  <dt className="text-sm text-muted">Total</dt>
                  <dd className="text-xl font-semibold tabular-nums tracking-tight">
                    {formatMoney(purchase.total)}
                  </dd>
                </div>
              </dl>
              {purchase.estado === 'BORRADOR' ? (
                <p className="mt-4 text-xs text-muted">
                  Borrador: todavía no afecta el inventario. Confirmá cuando la mercadería esté
                  lista para ingresar.
                </p>
              ) : null}
              {purchase.estado === 'CONFIRMADA' ? (
                <p className="mt-4 text-xs text-muted">
                  Confirmada: el stock ya fue actualizado. Esta compra no admite más cambios.
                </p>
              ) : null}
              {purchase.estado === 'CANCELADA' ? (
                <p className="mt-4 text-xs text-muted">
                  Cancelada: no generó movimientos de inventario y no admite edición.
                </p>
              ) : null}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Productos incluidos</h3>
              <p className="mt-1 text-sm text-muted">
                Cantidades y costos unitarios de la compra.
              </p>
            </div>

            {(purchase.items?.length ?? 0) === 0 ? (
              <Card>
                <EmptyState
                  icon={ClipboardList}
                  title="Sin ítems"
                  description="Esta compra no tiene productos asociados."
                />
              </Card>
            ) : (
              <PurchaseItemsTable items={purchase.items} />
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

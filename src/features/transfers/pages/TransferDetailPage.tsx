import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, ArrowRightLeft } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { TransferDetailActions } from '@/features/transfers/components/TransferDetailActions'
import { TransferItemsTable } from '@/features/transfers/components/TransferItemsTable'
import { TransferStatusBadge } from '@/features/transfers/components/TransferStatusBadge'
import { useTransfer } from '@/features/transfers/hooks/use-transfers'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatDateTime } from '@/lib/utils/format'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function TransferDetailPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const { id: idParam } = useParams()
  const transferId = parseId(idParam)
  const transferQuery = useTransfer(transferId)
  const transfer = transferQuery.data

  if (transferId == null) {
    return (
      <Card>
        <EmptyState
          icon={ArrowRightLeft}
          title="Transferencia no válida"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/transferencias"
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
          to="/transferencias"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Transferencias
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg leading-snug font-semibold tracking-tight">
                {transferQuery.isLoading
                  ? 'Cargando…'
                  : transfer
                    ? `Transferencia ${formatComprobante(transfer.numero)}`
                    : 'Transferencia'}
              </h2>
              {transfer ? <TransferStatusBadge estado={transfer.estado} /> : null}
            </div>
            {transfer ? (
              <p className="mt-2 text-sm text-muted">
                Registrada el {formatDateTime(transfer.createdAt)}
                {transfer.usuario?.nombre ? ` · por ${transfer.usuario.nombre}` : null}
              </p>
            ) : null}
          </div>

          {transfer ? (
            <div className="flex min-w-0 flex-col gap-2 lg:items-end">
              <TransferDetailActions
                transfer={transfer}
                isAdmin={isAdmin}
                onDeleted={() => void navigate('/transferencias')}
                onActionError={() => void transferQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </div>

      {transferQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando transferencia…</p>
        </Card>
      ) : null}

      {transferQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">
            No se pudo cargar la transferencia
          </p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(transferQuery.error)}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/transferencias"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void transferQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!transferQuery.isLoading && !transferQuery.isError && transfer ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold tracking-tight">Información general</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Origen</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {transfer.sucursalOrigen?.nombre ?? '—'}
                  </dd>
                  <dd className="mt-0.5 font-mono text-xs text-muted">
                    {transfer.sucursalOrigen?.codigo ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Destino</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {transfer.sucursalDestino?.nombre ?? '—'}
                  </dd>
                  <dd className="mt-0.5 font-mono text-xs text-muted">
                    {transfer.sucursalDestino?.codigo ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Fecha</dt>
                  <dd className="mt-1 text-sm tabular-nums">
                    {formatDateTime(transfer.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Responsable</dt>
                  <dd className="mt-1 text-sm">{transfer.usuario?.nombre ?? '—'}</dd>
                  {transfer.usuario?.email ? (
                    <dd className="mt-0.5 text-xs text-muted">{transfer.usuario.email}</dd>
                  ) : null}
                </div>
                {transfer.observacion?.trim() ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs tracking-wide text-muted uppercase">Observación</dt>
                    <dd className="mt-1 text-sm whitespace-pre-wrap">{transfer.observacion}</dd>
                  </div>
                ) : null}
              </dl>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold tracking-tight">Resumen</h3>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 font-medium">
                  {transfer.sucursalOrigen?.nombre ?? 'Origen'}
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
                <span className="rounded-lg bg-primary/10 px-2.5 py-1.5 font-medium text-primary">
                  {transfer.sucursalDestino?.nombre ?? 'Destino'}
                </span>
              </div>
              <dl className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">Productos</dt>
                  <dd className="text-sm tabular-nums font-medium">
                    {transfer.items?.length ?? 0}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">Unidades</dt>
                  <dd className="text-sm tabular-nums font-medium">
                    {transfer.items?.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) ??
                      0}
                  </dd>
                </div>
              </dl>
              {transfer.estado === 'BORRADOR' ? (
                <p className="mt-4 text-xs text-muted">
                  Borrador: todavía no afecta el inventario. Confirmá para mover el stock.
                </p>
              ) : null}
              {transfer.estado === 'CONFIRMADA' ? (
                <p className="mt-4 text-xs text-muted">
                  Confirmada: el stock ya fue actualizado. No admite más cambios.
                </p>
              ) : null}
              {transfer.estado === 'CANCELADA' ? (
                <p className="mt-4 text-xs text-muted">
                  Cancelada: no generó movimientos de inventario y no admite edición.
                </p>
              ) : null}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Productos transferidos</h3>
              <p className="mt-1 text-sm text-muted">
                Cantidades que salen del origen y entran en el destino.
              </p>
            </div>

            {(transfer.items?.length ?? 0) === 0 ? (
              <Card>
                <EmptyState
                  icon={ArrowRightLeft}
                  title="Sin ítems"
                  description="Esta transferencia no tiene productos asociados."
                />
              </Card>
            ) : (
              <TransferItemsTable items={transfer.items} />
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

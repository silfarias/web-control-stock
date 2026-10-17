import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowLeftRight, History, Lock, Wallet } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { CashMovementDialog } from '@/features/cash-register/components/CashMovementDialog'
import { CashMovementsTable } from '@/features/cash-register/components/CashMovementsTable'
import { CashStatusBadge } from '@/features/cash-register/components/CashStatusBadge'
import { CloseCashDialog } from '@/features/cash-register/components/CloseCashDialog'
import {
  useCashMovementsByCaja,
  useCashRegister,
} from '@/features/cash-register/hooks/use-cash-register'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatMoney } from '@/lib/utils/format'

const MOVEMENTS_PAGE_SIZE = 10

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function CashRegisterDetailPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'
  const { id: idParam } = useParams()
  const cajaId = parseId(idParam)
  const [closeDialog, setCloseDialog] = useState(false)
  const [movementDialog, setMovementDialog] = useState(false)
  const [movementsPage, setMovementsPage] = useState(1)

  const cajaQuery = useCashRegister(cajaId)
  const caja = cajaQuery.data
  const isOpen = caja?.estado === 'ABIERTA'

  const movementsParams = useMemo(
    () => ({
      pageNumber: movementsPage,
      pageSize: MOVEMENTS_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [movementsPage],
  )
  const movementsQuery = useCashMovementsByCaja(cajaId, movementsParams)
  const movements = movementsQuery.data?.data ?? []
  const movementsMeta = movementsQuery.data?.metadata

  if (cajaId == null) {
    return (
      <Card>
        <EmptyState
          icon={Wallet}
          title="Caja no válida"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/caja"
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver a caja
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
          to="/caja"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Caja
        </Link>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[1.75rem] leading-9 font-semibold tracking-tight">
                {cajaQuery.isLoading ? 'Cargando…' : `Caja #${cajaId}`}
              </h2>
              {caja ? <CashStatusBadge estado={caja.estado} /> : null}
            </div>
            {caja ? (
              <p className="mt-2 text-sm text-muted">
                Abierta el {formatDateTime(caja.abiertaEn)}
                {caja.usuario?.nombre ? ` · por ${caja.usuario.nombre}` : null}
              </p>
            ) : null}
          </div>
          {canManage && isOpen && caja ? (
            <div className="flex flex-wrap gap-2 self-start">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMovementDialog(true)}
              >
                <ArrowLeftRight className="size-4" aria-hidden />
                Ingreso / egreso
              </Button>
              <Button type="button" variant="outline" onClick={() => setCloseDialog(true)}>
                <Lock className="size-4" aria-hidden />
                Cerrar caja
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {cajaQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando caja…</p>
        </Card>
      ) : null}

      {cajaQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar la caja</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(cajaQuery.error)}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/caja"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver
            </Link>
            <Button type="button" onClick={() => void cajaQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!cajaQuery.isLoading && !cajaQuery.isError && caja ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold tracking-tight">Información general</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Responsable</dt>
                  <dd className="mt-1 text-sm font-medium">{caja.usuario?.nombre ?? '—'}</dd>
                  {caja.usuario?.email ? (
                    <dd className="mt-0.5 text-xs text-muted">{caja.usuario.email}</dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Estado</dt>
                  <dd className="mt-1">
                    <CashStatusBadge estado={caja.estado} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Apertura</dt>
                  <dd className="mt-1 text-sm tabular-nums">{formatDateTime(caja.abiertaEn)}</dd>
                </div>
                {caja.cerradaEn ? (
                  <div>
                    <dt className="text-xs tracking-wide text-muted uppercase">Cierre</dt>
                    <dd className="mt-1 text-sm tabular-nums">
                      {formatDateTime(caja.cerradaEn)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold tracking-tight">Montos</h3>
              <dl className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">Apertura</dt>
                  <dd className="text-sm tabular-nums font-medium">
                    {formatMoney(caja.montoApertura)}
                  </dd>
                </div>
                {caja.estado === 'CERRADA' ? (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-muted">Esperado</dt>
                      <dd className="text-sm tabular-nums font-medium">
                        {caja.montoEsperado != null ? formatMoney(caja.montoEsperado) : '—'}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
                      <dt className="text-sm text-muted">Contado</dt>
                      <dd className="text-lg font-semibold tabular-nums tracking-tight">
                        {caja.montoCierre != null ? formatMoney(caja.montoCierre) : '—'}
                      </dd>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted">
                    El monto esperado y la diferencia se informan al cerrar la caja.
                  </p>
                )}
              </dl>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Movimientos</h3>
              <p className="mt-1 text-sm text-muted">
                Ventas, ingresos y egresos asociados a esta caja.
              </p>
            </div>

            {movementsQuery.isLoading ? (
              <Card className="px-6 py-12 text-center">
                <p className="text-sm font-medium">Cargando movimientos…</p>
              </Card>
            ) : null}

            {movementsQuery.isError ? (
              <Card className="border-error/20 bg-error-soft px-6 py-8 text-center">
                <p className="text-sm font-semibold text-error-ink">
                  No se pudieron cargar los movimientos
                </p>
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
            movements.length === 0 ? (
              <Card>
                <EmptyState
                  icon={History}
                  title="Sin movimientos"
                  description="Esta caja no tiene movimientos registrados."
                />
              </Card>
            ) : null}

            {!movementsQuery.isLoading &&
            !movementsQuery.isError &&
            movements.length > 0 ? (
              <div className="flex flex-col gap-4">
                <CashMovementsTable movements={movements} />
                {movementsMeta && movementsMeta.totalPages > 1 ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">
                      Página {movementsMeta.pageNumber} de {movementsMeta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={movementsPage <= 1 || movementsQuery.isFetching}
                        onClick={() => setMovementsPage((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          movementsPage >= movementsMeta.totalPages ||
                          movementsQuery.isFetching
                        }
                        onClick={() => setMovementsPage((p) => p + 1)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <CloseCashDialog
        open={closeDialog}
        onOpenChange={setCloseDialog}
        caja={isOpen ? (caja ?? null) : null}
        onClosed={() => void cajaQuery.refetch()}
      />
      <CashMovementDialog
        open={movementDialog}
        onOpenChange={setMovementDialog}
        caja={isOpen ? (caja ?? null) : null}
      />
    </div>
  )
}

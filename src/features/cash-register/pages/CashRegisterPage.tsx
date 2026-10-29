import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeftRight, History, Lock, Unlock, Wallet } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { CashHistoryTable } from '@/features/cash-register/components/CashHistoryTable'
import { CashMovementDialog } from '@/features/cash-register/components/CashMovementDialog'
import { CashMovementsTable } from '@/features/cash-register/components/CashMovementsTable'
import { CashStatusBadge } from '@/features/cash-register/components/CashStatusBadge'
import { CloseCashDialog } from '@/features/cash-register/components/CloseCashDialog'
import { OpenCashDialog } from '@/features/cash-register/components/OpenCashDialog'
import {
  useActiveCashRegister,
  useCashMovementsByCaja,
  useCashRegisters,
} from '@/features/cash-register/hooks/use-cash-register'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatDateTime, formatMoney } from '@/lib/utils/format'

export function CashRegisterPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'

  const [openDialog, setOpenDialog] = useState(false)
  const [closeDialog, setCloseDialog] = useState(false)
  const [movementDialog, setMovementDialog] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [movementsPage, setMovementsPage] = useState(1)

  const activeQuery = useActiveCashRegister()
  const activeCaja = activeQuery.data ?? null
  const isOpen = activeCaja?.estado === 'ABIERTA'

  const historyParams = useMemo(
    () => ({
      pageNumber: historyPage,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [historyPage],
  )
  const historyQuery = useCashRegisters(historyParams)
  const history = historyQuery.data?.data ?? []
  const historyMeta = historyQuery.data?.metadata

  const movementsParams = useMemo(
    () => ({
      pageNumber: movementsPage,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'id',
      orderDirection: 'DESC' as const,
    }),
    [movementsPage],
  )
  const movementsQuery = useCashMovementsByCaja(activeCaja?.id ?? null, movementsParams)
  const movements = movementsQuery.data?.data ?? []
  const movementsMeta = movementsQuery.data?.metadata

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 max-w-2xl text-sm text-muted">
          Consultá el estado actual, abrí o cerrá la jornada y revisá el historial. Solo puede
          haber una caja abierta a la vez.
        </p>
        <div className="flex flex-wrap gap-2">
          {canManage && !isOpen ? (
            <Button type="button" onClick={() => setOpenDialog(true)}>
              <Unlock className="size-4" aria-hidden />
              Abrir caja
            </Button>
          ) : null}
          {canManage && isOpen && activeCaja ? (
            <>
              <Button type="button" variant="outline" onClick={() => setMovementDialog(true)}>
                <ArrowLeftRight className="size-4" aria-hidden />
                Ingreso / egreso
              </Button>
              <Button type="button" variant="outline" onClick={() => setCloseDialog(true)}>
                <Lock className="size-4" aria-hidden />
                Cerrar caja
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {activeQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Consultando estado de caja…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {activeQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo consultar la caja</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(activeQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void activeQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && !isOpen ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-base font-semibold tracking-tight">Estado actual</h3>
                <CashStatusBadge estado="CERRADA" />
              </div>
              <p className="mt-2 text-sm text-muted">
                No hay una caja abierta. {canManage
                  ? 'Podés abrir una nueva jornada con el monto inicial disponible.'
                  : 'Cuando un administrador abra la caja, vas a ver aquí el detalle.'}
              </p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-muted text-primary">
              <Wallet className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </Card>
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && isOpen && activeCaja ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold tracking-tight">
                  Caja {formatComprobante(activeCaja.numero)}
                </h3>
                <CashStatusBadge estado={activeCaja.estado} />
              </div>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Responsable</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {activeCaja.usuario?.nombre ?? '—'}
                  </dd>
                  {activeCaja.usuario?.email ? (
                    <dd className="mt-0.5 text-xs text-muted">{activeCaja.usuario.email}</dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Apertura</dt>
                  <dd className="mt-1 text-sm tabular-nums">
                    {formatDateTime(activeCaja.abiertaEn)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Monto de apertura</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
                    {formatMoney(activeCaja.montoApertura)}
                  </dd>
                </div>
              </dl>
              <div className="mt-5">
                <Link
                  to={`/caja/${activeCaja.id}`}
                  className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
                >
                  Ver detalle completo
                </Link>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold tracking-tight">Operación</h3>
              <p className="mt-2 text-sm text-muted">
                Las ventas en efectivo y los movimientos manuales quedan en el historial. El saldo
                esperado se calcula al cerrar.
              </p>
              {canManage ? (
                <div className="mt-5 flex flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={() => setMovementDialog(true)}
                  >
                    <ArrowLeftRight className="size-4" aria-hidden />
                    Ingreso / egreso
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={() => setCloseDialog(true)}
                  >
                    <Lock className="size-4" aria-hidden />
                    Cerrar caja
                  </Button>
                </div>
              ) : (
                <p className="mt-5 text-xs text-muted">
                  Solo un administrador puede registrar movimientos o cerrar la caja.
                </p>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Movimientos de la caja</h3>
              <p className="mt-1 text-sm text-muted">
                Operaciones registradas en la caja abierta actual.
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
                  description="Todavía no hay ventas ni movimientos registrados en esta caja."
                />
              </Card>
            ) : null}

            {!movementsQuery.isLoading &&
            !movementsQuery.isError &&
            movements.length > 0 ? (
              <div className="flex flex-col gap-4">
                <CashMovementsTable movements={movements} />
                {movementsMeta ? (
                  <ListPagination
                    pageNumber={movementsMeta.pageNumber}
                    totalPages={movementsMeta.totalPages}
                    disabled={movementsQuery.isFetching}
                    onPageChange={setMovementsPage}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Historial de cajas</h3>
          <p className="mt-1 text-sm text-muted">
            Aperturas y cierres registrados. Los montos de cierre y esperado aparecen cuando la
            caja ya está cerrada.
          </p>
        </div>

        {historyQuery.isLoading ? (
          <Card className="px-6 py-12 text-center">
            <p className="text-sm font-medium">Cargando historial…</p>
          </Card>
        ) : null}

        {historyQuery.isError ? (
          <Card className="border-error/20 bg-error-soft px-6 py-8 text-center">
            <p className="text-sm font-semibold text-error-ink">
              No se pudo cargar el historial
            </p>
            <p className="mt-1 text-sm text-error-ink/90">
              {getApiErrorMessage(historyQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 bg-surface"
              onClick={() => void historyQuery.refetch()}
            >
              Reintentar
            </Button>
          </Card>
        ) : null}

        {!historyQuery.isLoading && !historyQuery.isError && history.length === 0 ? (
          <Card>
            <EmptyState
              icon={Wallet}
              title="Sin historial"
              description="Cuando se abran cajas, van a aparecer en este listado."
            />
          </Card>
        ) : null}

        {!historyQuery.isLoading && !historyQuery.isError && history.length > 0 ? (
          <div className="flex flex-col gap-4">
            <CashHistoryTable cajas={history} />
            {historyMeta ? (
              <ListPagination
                pageNumber={historyMeta.pageNumber}
                totalPages={historyMeta.totalPages}
                count={historyMeta.count}
                itemLabel={{ singular: 'caja', plural: 'cajas' }}
                disabled={historyQuery.isFetching}
                onPageChange={setHistoryPage}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <OpenCashDialog open={openDialog} onOpenChange={setOpenDialog} />
      <CloseCashDialog
        open={closeDialog}
        onOpenChange={setCloseDialog}
        caja={activeCaja}
        onClosed={() => setMovementsPage(1)}
      />
      <CashMovementDialog
        open={movementDialog}
        onOpenChange={setMovementDialog}
        caja={isOpen ? activeCaja : null}
      />
    </div>
  )
}

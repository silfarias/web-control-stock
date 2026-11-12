import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  useCancelTransfer,
  useConfirmTransfer,
  useDeleteTransfer,
} from '@/features/transfers/hooks/use-transfer-mutations'
import type { Transferencia } from '@/features/transfers/types'
import {
  getTransferDraftActions,
  transferHasItems,
} from '@/features/transfers/utils/transfer-actions'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatComprobante } from '@/lib/utils/format'

type TransferDetailActionsProps = {
  transfer: Transferencia
  isAdmin: boolean
  onDeleted: () => void
  onActionError: () => void
}

type DialogKind = 'confirm' | 'cancel' | 'delete' | null

export function TransferDetailActions({
  transfer,
  isAdmin,
  onDeleted,
  onActionError,
}: TransferDetailActionsProps) {
  const { pushToast } = useToast()
  const [dialog, setDialog] = useState<DialogKind>(null)

  const confirmMutation = useConfirmTransfer()
  const cancelMutation = useCancelTransfer()
  const deleteMutation = useDeleteTransfer()

  const actions = getTransferDraftActions(transfer.estado, isAdmin)
  const hasAnyAction =
    actions.canEdit || actions.canConfirm || actions.canCancel || actions.canDelete

  if (!hasAnyAction) return null

  const busy =
    confirmMutation.isPending || cancelMutation.isPending || deleteMutation.isPending
  const itemCount = transfer.items?.length ?? 0
  const canConfirmNow = actions.canConfirm && transferHasItems(transfer)

  async function handleConfirm() {
    try {
      const updated = await confirmMutation.mutateAsync(transfer.id)
      pushToast({
        tone: 'success',
        title: 'Transferencia confirmada',
        description: `Se movió el stock de ${updated.sucursalOrigen.nombre} a ${updated.sucursalDestino.nombre}.`,
      })
      setDialog(null)
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo confirmar',
        description: getApiErrorMessage(error),
      })
      onActionError()
    }
  }

  async function handleCancel() {
    try {
      const updated = await cancelMutation.mutateAsync(transfer.id)
      pushToast({
        tone: 'success',
        title: 'Transferencia cancelada',
        description: `La transferencia ${formatComprobante(updated.numero)} quedó cancelada. No se movió stock.`,
      })
      setDialog(null)
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo cancelar',
        description: getApiErrorMessage(error),
      })
      onActionError()
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(transfer.id)
      pushToast({
        tone: 'success',
        title: 'Borrador eliminado',
        description: `La transferencia ${formatComprobante(transfer.numero)} ya no aparece en los listados.`,
      })
      setDialog(null)
      onDeleted()
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo eliminar',
        description: getApiErrorMessage(error),
      })
      onActionError()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {actions.canConfirm ? (
          <Button
            type="button"
            disabled={busy || !canConfirmNow}
            onClick={() => setDialog('confirm')}
            title={
              !transferHasItems(transfer)
                ? 'Agregá al menos un producto antes de confirmar'
                : undefined
            }
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Confirmar transferencia
          </Button>
        ) : null}

        {actions.canEdit ? (
          <Link
            to={`/transferencias/${transfer.id}/editar`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              busy && 'pointer-events-none opacity-50',
            )}
            aria-disabled={busy || undefined}
          >
            <Pencil className="size-4" aria-hidden />
            Editar borrador
          </Link>
        ) : null}

        {actions.canCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setDialog('cancel')}
          >
            <Ban className="size-4" aria-hidden />
            Cancelar
          </Button>
        ) : null}

        {actions.canDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="text-error-ink hover:bg-error-soft hover:text-error-ink"
            disabled={busy}
            onClick={() => setDialog('delete')}
          >
            <Trash2 className="size-4" aria-hidden />
            Eliminar
          </Button>
        ) : null}
      </div>

      {!transferHasItems(transfer) && actions.canConfirm ? (
        <p className="text-xs text-muted sm:text-right">
          Para confirmar, la transferencia debe tener al menos un producto.
        </p>
      ) : null}

      <ConfirmDialog
        open={dialog === 'confirm'}
        onOpenChange={(open) => {
          if (!confirmMutation.isPending) setDialog(open ? 'confirm' : null)
        }}
        title={`Confirmar transferencia ${formatComprobante(transfer.numero)}`}
        description="Se descontará stock en el origen y se sumará en el destino. Si alguna cantidad supera el disponible, la operación se rechaza completa. Después no se podrá editar."
        confirmLabel="Confirmar transferencia"
        cancelLabel="Volver"
        loading={confirmMutation.isPending}
        onConfirm={() => void handleConfirm()}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">Origen</dt>
            <dd className="text-right font-medium">{transfer.sucursalOrigen?.nombre ?? '—'}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">Destino</dt>
            <dd className="text-right font-medium">{transfer.sucursalDestino?.nombre ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2">
            <dt className="text-muted">Productos</dt>
            <dd className="tabular-nums font-medium">
              {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
            </dd>
          </div>
        </dl>
        {(transfer.items?.length ?? 0) > 0 ? (
          <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-surface-muted/40 px-3 py-2 text-sm">
            {transfer.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {item.producto?.nombre ?? 'Producto eliminado'}
                </span>
                <span className="shrink-0 tabular-nums font-medium">
                  <ArrowRight className="mr-1 inline size-3 text-muted" aria-hidden />
                  {item.cantidad}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'cancel'}
        onOpenChange={(open) => {
          if (!cancelMutation.isPending) setDialog(open ? 'cancel' : null)
        }}
        title={`Cancelar transferencia ${formatComprobante(transfer.numero)}`}
        description="La transferencia quedará cancelada y ya no podrá editarse. No se generarán movimientos de inventario."
        confirmLabel="Cancelar transferencia"
        cancelLabel="Volver"
        loading={cancelMutation.isPending}
        tone="danger"
        onConfirm={() => void handleCancel()}
      />

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) setDialog(open ? 'delete' : null)
        }}
        title={`Eliminar borrador ${formatComprobante(transfer.numero)}`}
        description="Se dará de baja el borrador y dejará de aparecer en los listados. Cancelar conserva el registro con estado cancelada."
        confirmLabel="Eliminar borrador"
        cancelLabel="Volver"
        loading={deleteMutation.isPending}
        tone="danger"
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'
import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  useCancelPurchase,
  useConfirmPurchase,
  useDeletePurchase,
} from '@/features/purchases/hooks/use-purchase-mutations'
import type { Compra } from '@/features/purchases/types'
import {
  getPurchaseDraftActions,
  purchaseHasItems,
  purchaseSupplierIsActive,
} from '@/features/purchases/utils/purchase-actions'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatMoney } from '@/lib/utils/format'

type PurchaseDetailActionsProps = {
  purchase: Compra
  isAdmin: boolean
  onDeleted: () => void
  onActionError: () => void
}

type DialogKind = 'confirm' | 'cancel' | 'delete' | null

export function PurchaseDetailActions({
  purchase,
  isAdmin,
  onDeleted,
  onActionError,
}: PurchaseDetailActionsProps) {
  const { pushToast } = useToast()
  const [dialog, setDialog] = useState<DialogKind>(null)

  const confirmMutation = useConfirmPurchase()
  const cancelMutation = useCancelPurchase()
  const deleteMutation = useDeletePurchase()

  const actions = getPurchaseDraftActions(purchase.estado, isAdmin)
  const hasAnyAction =
    actions.canEdit || actions.canConfirm || actions.canCancel || actions.canDelete

  if (!hasAnyAction) return null

  const busy =
    confirmMutation.isPending || cancelMutation.isPending || deleteMutation.isPending
  const itemCount = purchase.items?.length ?? 0
  const canConfirmNow =
    actions.canConfirm && purchaseHasItems(purchase) && purchaseSupplierIsActive(purchase)

  async function handleConfirm() {
    try {
      const updated = await confirmMutation.mutateAsync(purchase.id)
      pushToast({
        tone: 'success',
        title: 'Compra confirmada',
        description: `La compra ${formatComprobante(updated.numero)} ingresó mercadería al inventario.`,
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
      const updated = await cancelMutation.mutateAsync(purchase.id)
      pushToast({
        tone: 'success',
        title: 'Compra cancelada',
        description: `La compra ${formatComprobante(updated.numero)} quedó en estado cancelada. No se movió stock.`,
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
      await deleteMutation.mutateAsync(purchase.id)
      pushToast({
        tone: 'success',
        title: 'Borrador eliminado',
        description: `La compra ${formatComprobante(purchase.numero)} ya no aparece en los listados.`,
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
              !purchaseHasItems(purchase)
                ? 'Agregá al menos un producto antes de confirmar'
                : !purchaseSupplierIsActive(purchase)
                  ? 'El proveedor debe estar activo para confirmar'
                  : undefined
            }
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Confirmar compra
          </Button>
        ) : null}

        {actions.canEdit ? (
          <Link
            to={`/compras/${purchase.id}/editar`}
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

      {!purchaseHasItems(purchase) && actions.canConfirm ? (
        <p className="text-xs text-muted sm:text-right">
          Para confirmar, la compra debe tener al menos un producto.
        </p>
      ) : null}
      {purchaseHasItems(purchase) &&
      !purchaseSupplierIsActive(purchase) &&
      actions.canConfirm ? (
        <p className="text-xs text-warning-ink sm:text-right">
          El proveedor está inactivo. Reactivalo o cambiá el proveedor antes de confirmar.
        </p>
      ) : null}

      <ConfirmDialog
        open={dialog === 'confirm'}
        onOpenChange={(open) => {
          if (!confirmMutation.isPending) setDialog(open ? 'confirm' : null)
        }}
        title={`Confirmar compra ${formatComprobante(purchase.numero)}`}
        description="La compra pasará a confirmada, se registrará la entrada de mercadería y aumentará el stock. Después ya no podrá editarse."
        confirmLabel="Confirmar compra"
        cancelLabel="Volver"
        loading={confirmMutation.isPending}
        onConfirm={() => void handleConfirm()}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Proveedor</dt>
            <dd className="font-medium text-right">{purchase.proveedor?.nombre ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Productos</dt>
            <dd className="tabular-nums font-medium">
              {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2">
            <dt className="text-muted">Total</dt>
            <dd className="tabular-nums font-semibold">{formatMoney(purchase.total)}</dd>
          </div>
        </dl>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'cancel'}
        onOpenChange={(open) => {
          if (!cancelMutation.isPending) setDialog(open ? 'cancel' : null)
        }}
        title={`Cancelar compra ${formatComprobante(purchase.numero)}`}
        description="La compra quedará cancelada y ya no podrá editarse. No se generarán movimientos de inventario ni cambios de stock."
        confirmLabel="Cancelar compra"
        cancelLabel="Volver"
        loading={cancelMutation.isPending}
        tone="danger"
        onConfirm={() => void handleCancel()}
      >
        <p className="text-sm text-muted">
          Proveedor: <span className="font-medium text-foreground">{purchase.proveedor?.nombre ?? '—'}</span>
          {' · '}
          Total: <span className="font-medium text-foreground">{formatMoney(purchase.total)}</span>
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) setDialog(open ? 'delete' : null)
        }}
        title={`Eliminar borrador ${formatComprobante(purchase.numero)}`}
        description="Se dará de baja el borrador y dejará de aparecer en los listados. Esto no es lo mismo que cancelar: cancelar conserva el registro con estado cancelada."
        confirmLabel="Eliminar borrador"
        cancelLabel="Volver"
        loading={deleteMutation.isPending}
        tone="danger"
        onConfirm={() => void handleDelete()}
      >
        <p className="text-sm text-muted">
          Proveedor: <span className="font-medium text-foreground">{purchase.proveedor?.nombre ?? '—'}</span>
          {' · '}
          Total: <span className="font-medium text-foreground">{formatMoney(purchase.total)}</span>
        </p>
      </ConfirmDialog>
    </>
  )
}

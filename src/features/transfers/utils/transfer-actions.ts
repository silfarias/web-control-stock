import type { EstadoTransferencia, Transferencia } from '@/features/transfers/types'

export type TransferDraftActions = {
  canEdit: boolean
  canConfirm: boolean
  canCancel: boolean
  canDelete: boolean
}

/** Acciones de escritura según rol y estado (UI). El backend autoriza de forma definitiva. */
export function getTransferDraftActions(
  estado: EstadoTransferencia | undefined,
  isAdmin: boolean,
): TransferDraftActions {
  const isDraft = isAdmin && estado === 'BORRADOR'
  return {
    canEdit: isDraft,
    canConfirm: isDraft,
    canCancel: isDraft,
    canDelete: isDraft,
  }
}

export function transferHasItems(transfer: Transferencia) {
  return (transfer.items?.length ?? 0) > 0
}

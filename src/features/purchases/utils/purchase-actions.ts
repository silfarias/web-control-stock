import type { Compra, EstadoCompra } from '@/features/purchases/types'

export type PurchaseDraftActions = {
  canEdit: boolean
  canConfirm: boolean
  canCancel: boolean
  canDelete: boolean
}

/** Acciones de escritura disponibles según rol y estado (UI). El backend autoriza de forma definitiva. */
export function getPurchaseDraftActions(
  estado: EstadoCompra | undefined,
  isAdmin: boolean,
): PurchaseDraftActions {
  const isDraft = isAdmin && estado === 'BORRADOR'
  return {
    canEdit: isDraft,
    canConfirm: isDraft,
    canCancel: isDraft,
    canDelete: isDraft,
  }
}

export function purchaseHasItems(purchase: Compra) {
  return (purchase.items?.length ?? 0) > 0
}

export function purchaseSupplierIsActive(purchase: Compra) {
  return purchase.proveedor?.activo !== false
}

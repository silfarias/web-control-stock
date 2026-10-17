import { Badge } from '@/components/ui/Badge'
import type { EstadoCompra } from '@/features/purchases/types'
import {
  purchaseStatusLabel,
  purchaseStatusTone,
} from '@/features/purchases/utils/purchase-status'

type PurchaseStatusBadgeProps = {
  estado: EstadoCompra
}

export function PurchaseStatusBadge({ estado }: PurchaseStatusBadgeProps) {
  return <Badge tone={purchaseStatusTone(estado)}>{purchaseStatusLabel(estado)}</Badge>
}

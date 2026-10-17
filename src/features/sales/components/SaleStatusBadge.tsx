import { Badge } from '@/components/ui/Badge'
import type { EstadoVenta } from '@/features/sales/types'
import { saleStatusLabel, saleStatusTone } from '@/features/sales/utils/sale-labels'

type SaleStatusBadgeProps = {
  estado: EstadoVenta
}

export function SaleStatusBadge({ estado }: SaleStatusBadgeProps) {
  return <Badge tone={saleStatusTone(estado)}>{saleStatusLabel(estado)}</Badge>
}

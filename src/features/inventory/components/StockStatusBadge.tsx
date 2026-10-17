import { Badge } from '@/components/ui/Badge'
import type { StockStatus } from '@/features/inventory/types'
import { stockStatusLabel } from '@/features/inventory/utils/stock-status'

type StockStatusBadgeProps = {
  status: StockStatus
}

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  if (status === 'unknown') {
    return <Badge tone="neutral">{stockStatusLabel(status)}</Badge>
  }
  if (status === 'out') {
    return <Badge tone="error">{stockStatusLabel(status)}</Badge>
  }
  if (status === 'low') {
    return <Badge tone="warning">{stockStatusLabel(status)}</Badge>
  }
  return <Badge tone="success">{stockStatusLabel(status)}</Badge>
}

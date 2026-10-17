import { Badge } from '@/components/ui/Badge'
import { getStockStatus, stockStatusLabel } from '@/features/inventory/utils/stock-status'
import { cn } from '@/lib/utils/cn'

type ProductStockCellProps = {
  cantidad: number | null | undefined
  minimoStock: number
  loading?: boolean
  /** Si es true, muestra badge también cuando el stock está OK. */
  showOkBadge?: boolean
}

export function ProductStockCell({
  cantidad,
  minimoStock,
  loading,
  showOkBadge = false,
}: ProductStockCellProps) {
  if (loading) {
    return <span className="text-sm text-muted">…</span>
  }

  const status = getStockStatus(cantidad, minimoStock)

  if (status === 'unknown') {
    return <span className="text-sm text-muted">{stockStatusLabel(status)}</span>
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={cn(
          'tabular-nums font-medium',
          status === 'out' && 'text-error-ink',
          status === 'low' && 'text-warning-ink',
        )}
      >
        {cantidad}
      </span>
      {status === 'out' ? (
        <Badge tone="error">{stockStatusLabel(status)}</Badge>
      ) : status === 'low' ? (
        <Badge tone="warning">{stockStatusLabel(status)}</Badge>
      ) : showOkBadge ? (
        <Badge tone="success">{stockStatusLabel(status)}</Badge>
      ) : null}
    </div>
  )
}

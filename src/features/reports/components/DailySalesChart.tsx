import type { ReporteVentasDiarioItem } from '@/features/reports/types'
import { formatMoney, formatShortDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

type DailySalesChartProps = {
  items: ReporteVentasDiarioItem[]
  className?: string
}

export function DailySalesChart({ items, className }: DailySalesChartProps) {
  const maxIngresos = Math.max(...items.map((item) => item.totalIngresos), 0)

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const widthPct =
          maxIngresos > 0 ? Math.max((item.totalIngresos / maxIngresos) * 100, 2) : 0

        return (
          <div key={item.fecha} className="grid gap-1.5 sm:grid-cols-[7.5rem_1fr_auto] sm:items-center sm:gap-3">
            <div className="text-sm font-medium tabular-nums">
              {formatShortDate(`${item.fecha}T12:00:00`)}
            </div>
            <div className="h-8 overflow-hidden rounded-lg bg-surface-muted">
              <div
                className="flex h-full items-center rounded-lg bg-primary/80 px-2 transition-[width] duration-300"
                style={{ width: `${widthPct}%` }}
                title={formatMoney(item.totalIngresos)}
              >
                {widthPct > 28 ? (
                  <span className="truncate text-xs font-medium text-primary-foreground">
                    {formatMoney(item.totalIngresos)}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="text-right text-xs text-muted tabular-nums sm:min-w-[6.5rem]">
              {item.cantidadVentas} venta{item.cantidadVentas === 1 ? '' : 's'}
              {widthPct <= 28 ? (
                <span className="mt-0.5 block font-medium text-foreground sm:mt-0 sm:inline sm:before:content-['·_']">
                  {formatMoney(item.totalIngresos)}
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

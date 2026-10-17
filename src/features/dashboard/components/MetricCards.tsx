import { AlertTriangle, ArrowLeftRight, Package, Wallet, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type {
  DashboardSummary,
  EmployeeDashboardSummary,
} from '@/features/dashboard/types'
import { formatMoney } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

type Metric = {
  label: string
  value: string
  detail: string
  icon?: LucideIcon
  featured?: boolean
  iconClassName?: string
}

type MetricCardsProps = {
  summary?: DashboardSummary | null
  employeeSummary?: EmployeeDashboardSummary | null
  loading?: boolean
}

export function MetricCards({
  summary,
  employeeSummary,
  loading = false,
}: MetricCardsProps) {
  const metrics: Metric[] = summary
    ? [
        {
          label: 'Ventas del día',
          value: formatMoney(summary.salesToday),
          detail: summary.salesDetail,
          featured: true,
        },
        {
          label: 'Productos',
          value: String(summary.products),
          detail: summary.productsDetail,
          icon: Package,
          iconClassName: 'bg-surface-muted text-primary',
        },
        {
          label: 'Stock bajo',
          value: String(summary.lowStock),
          detail: summary.lowStockDetail,
          icon: AlertTriangle,
          iconClassName: 'bg-warning-soft text-warning-ink',
        },
        {
          label: 'Movimientos',
          value: String(summary.movements),
          detail: summary.movementsDetail,
          icon: ArrowLeftRight,
          iconClassName: 'bg-accent-soft text-accent-ink',
        },
      ]
    : employeeSummary
      ? [
          {
            label: 'Caja',
            value: employeeSummary.cashLabel,
            detail: employeeSummary.cashDetail,
            featured: true,
            icon: Wallet,
            iconClassName: 'bg-white/15 text-white',
          },
          {
            label: 'Productos',
            value: String(employeeSummary.products),
            detail: employeeSummary.productsDetail,
            icon: Package,
            iconClassName: 'bg-surface-muted text-primary',
          },
          {
            label: 'Ventas',
            value: String(employeeSummary.salesTotal),
            detail: employeeSummary.salesDetail,
            icon: ArrowLeftRight,
            iconClassName: 'bg-accent-soft text-accent-ink',
          },
          {
            label: 'Inventario',
            value: String(employeeSummary.stockRecords),
            detail: employeeSummary.stockDetail,
            icon: AlertTriangle,
            iconClassName: 'bg-warning-soft text-warning-ink',
          },
        ]
      : []

  if (loading && metrics.length === 0) {
    return (
      <section aria-labelledby="indicadores-dia" aria-busy="true">
        <h2 id="indicadores-dia" className="sr-only">
          Indicadores del día
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="min-h-[138px] animate-pulse bg-surface-muted/60 p-4" />
          ))}
        </div>
      </section>
    )
  }

  if (metrics.length === 0) return null

  return (
    <section aria-labelledby="indicadores-dia">
      <h2 id="indicadores-dia" className="sr-only">
        Indicadores del día
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card
              key={metric.label}
              className={cn(
                'relative min-h-[138px] overflow-hidden p-4',
                metric.featured && 'border-primary bg-primary text-white',
              )}
            >
              {metric.featured ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-accent"
                />
              ) : null}
              <div className="relative flex items-start justify-between gap-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    metric.featured ? 'text-white/90' : 'text-muted',
                  )}
                >
                  {metric.label}
                </p>
                {Icon && !metric.featured ? (
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-xl',
                      metric.iconClassName,
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                ) : null}
              </div>
              <p className="relative mt-5 text-[1.65rem] leading-none font-semibold tracking-tight tabular-nums">
                {metric.value}
              </p>
              <p
                className={cn(
                  'relative mt-2 text-sm',
                  metric.featured ? 'text-white/85' : 'text-muted',
                )}
              >
                {metric.detail}
              </p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

import { Badge } from '@/components/ui/Badge'
import { LowStockList } from '@/features/dashboard/components/LowStockList'
import { MetricCards } from '@/features/dashboard/components/MetricCards'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import { RecentSales } from '@/features/dashboard/components/RecentSales'
import { SalesChart } from '@/features/dashboard/components/SalesChart'
import {
  dashboardSummary,
  getSalesSeries,
  lowStockItems,
  recentSales,
} from '@/features/dashboard/data/mock-dashboard'
import { formatLongDate, getGreeting } from '@/lib/utils/format'

export function DashboardPage() {
  const today = new Date()

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
        <div className="min-w-0 max-w-xl">
          <p className="text-sm font-medium text-muted">{formatLongDate(today)}</p>
          <h2 className="mt-1 text-[1.75rem] leading-9 font-semibold tracking-tight">
            {getGreeting(today)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Resumen del día para el comercio. Los valores de esta pantalla son de demostración.
          </p>
        </div>
        <Badge tone="accent" className="shrink-0">
          Datos de demostración
        </Badge>
      </div>

      <QuickActions />
      <MetricCards summary={dashboardSummary} />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <SalesChart series={getSalesSeries(today)} />
        <LowStockList items={lowStockItems} />
      </div>

      <RecentSales sales={recentSales} />
    </div>
  )
}

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { LowStockList } from '@/features/dashboard/components/LowStockList'
import { MetricCards } from '@/features/dashboard/components/MetricCards'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import { RecentSales } from '@/features/dashboard/components/RecentSales'
import { SalesChart } from '@/features/dashboard/components/SalesChart'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatLongDate, getGreeting } from '@/lib/utils/format'

export function DashboardPage() {
  const { user } = useAuth()
  const dashboard = useDashboard()
  const today = dashboard.today

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
        <div className="min-w-0 max-w-xl">
          <p className="text-sm font-medium text-muted">{formatLongDate(today)}</p>
          <h2 className="mt-1 text-lg leading-snug font-semibold tracking-tight">
            {getGreeting(today)}
            {user?.nombre ? `, ${user.nombre.split(' ')[0]}` : ''}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {dashboard.isAdmin
              ? 'Resumen del día: ventas, stock y movimientos.'
              : 'Vista operativa con la información disponible para tu rol.'}
          </p>
        </div>
      </div>

      <QuickActions />

      {dashboard.isError ? (
        <Alert tone="error">
          <AlertCircle className="size-4" aria-hidden />
          <AlertTitle>No se pudo completar el panel</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>Algunas consultas del panel no pudieron cargarse.</p>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-surface"
                onClick={() => dashboard.refetchAll()}
              >
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <MetricCards
        summary={dashboard.adminSummary}
        employeeSummary={dashboard.employeeSummary}
        loading={dashboard.isLoading}
      />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <SalesChart
          series={dashboard.series}
          loading={dashboard.chartLoading}
          error={dashboard.chartError}
          restricted={!dashboard.isAdmin}
          onRetry={() => dashboard.refetchAll()}
        />
        <LowStockList
          items={dashboard.lowStockItems}
          loading={dashboard.lowStockLoading}
          error={dashboard.lowStockError}
          onRetry={() => dashboard.refetchAll()}
        />
      </div>

      <RecentSales
        sales={dashboard.recentSales}
        loading={dashboard.recentLoading}
        error={dashboard.recentError}
        onRetry={() => dashboard.refetchAll()}
      />
    </div>
  )
}

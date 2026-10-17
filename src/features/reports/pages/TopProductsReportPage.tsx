import { Card } from '@/components/ui/Card'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { TopProductsTable } from '@/features/reports/components/TopProductsTable'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useTopProductsReport } from '@/features/reports/hooks/use-reports'
import { hasActiveFilters } from '@/features/reports/utils/report-filters'

export function TopProductsReportPage() {
  const { filtro, values, setValues, clear } = useReportFilterParams('top')
  const query = useTopProductsReport(filtro)
  const items = query.data ?? []
  const filtered = hasActiveFilters(filtro)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Productos más vendidos</h2>
        <p className="mt-1 text-sm text-muted">
          Ranking por unidades vendidas. El límite se envía al servidor (máx. 100).
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <ReportFiltersBar
          values={values}
          onChange={setValues}
          onClear={clear}
          showDates
          showLimite
        />
      </Card>

      <ReportQueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={items.length === 0}
        emptyTitle={filtered ? 'Sin resultados para el filtro' : 'Sin productos vendidos'}
        emptyDescription={
          filtered
            ? 'Ajustá fechas, categoría o límite e intentá de nuevo.'
            : 'Todavía no hay ítems de ventas confirmadas para armar el ranking.'
        }
        onRetry={() => void query.refetch()}
      >
        <Card className="overflow-hidden">
          <TopProductsTable items={items} />
        </Card>
      </ReportQueryState>
    </div>
  )
}

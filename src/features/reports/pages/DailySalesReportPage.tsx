import { Card } from '@/components/ui/Card'
import { DailySalesChart } from '@/features/reports/components/DailySalesChart'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useDailySalesReport } from '@/features/reports/hooks/use-reports'
import { hasActiveFilters } from '@/features/reports/utils/report-filters'

export function DailySalesReportPage() {
  const { filtro, values, setValues, clear } = useReportFilterParams('ventas')
  const query = useDailySalesReport(filtro)
  const items = query.data ?? []
  const filtered = hasActiveFilters(filtro)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Ventas diarias</h2>
        <p className="mt-1 text-sm text-muted">
          Cantidad e ingresos agrupados por día.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <ReportFiltersBar
          values={values}
          onChange={setValues}
          onClear={clear}
          showDates
        />
      </Card>

      <ReportQueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={items.length === 0}
        emptyTitle={filtered ? 'Sin ventas en el filtro' : 'Sin ventas diarias'}
        emptyDescription={
          filtered
            ? 'Probá ampliar el rango de fechas o quitar filtros.'
            : 'Cuando haya ventas confirmadas, aparecerán agrupadas por día.'
        }
        onRetry={() => void query.refetch()}
      >
        <Card className="p-4 sm:p-5">
          <DailySalesChart items={items} />
        </Card>
      </ReportQueryState>
    </div>
  )
}

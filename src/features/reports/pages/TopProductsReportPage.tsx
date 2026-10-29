import { Card } from '@/components/ui/Card'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { TopProductsTable } from '@/features/reports/components/TopProductsTable'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useTopProductsReport } from '@/features/reports/hooks/use-reports'
import { hasActiveFilters } from '@/features/reports/utils/report-filters'

export function TopProductsReportPage() {
  const { filtro, values, setValues, clear, productHint, reportEnabled, productPending, productBlocked } =
    useReportFilterParams('top')
  const query = useTopProductsReport(filtro, { enabled: reportEnabled })
  const items = query.data ?? []
  const filtered = hasActiveFilters(filtro)

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Ranking por unidades vendidas. Podés limitar cuántos productos ver (máx. 100).
      </p>

      <Card className="p-4 sm:p-5">
        <ReportFiltersBar
          values={values}
          onChange={setValues}
          onClear={clear}
          showDates
          showLimite
          productHint={productHint}
        />
      </Card>

      {productBlocked ? null : (
        <ReportQueryState
          isLoading={productPending || query.isLoading}
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
      )}
    </div>
  )
}

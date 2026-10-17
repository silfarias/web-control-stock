import { Card } from '@/components/ui/Card'
import { LowStockTable } from '@/features/reports/components/LowStockTable'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useLowStockReport } from '@/features/reports/hooks/use-reports'
import { hasActiveFilters } from '@/features/reports/utils/report-filters'

export function LowStockReportPage() {
  const { filtro, values, setValues, clear } = useReportFilterParams('catalogo')
  const query = useLowStockReport(filtro)
  const items = query.data ?? []
  const filtered = hasActiveFilters(filtro, { ignoreLimite: true })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Stock bajo</h2>
        <p className="mt-1 text-sm text-muted">
          Productos con cantidad menor o igual al mínimo configurado.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <ReportFiltersBar values={values} onChange={setValues} onClear={clear} />
      </Card>

      <ReportQueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={items.length === 0}
        emptyTitle={filtered ? 'Sin productos con ese filtro' : 'Ningún producto con stock bajo'}
        emptyDescription={
          filtered
            ? 'Probá otra categoría o producto.'
            : 'Todos los productos están por encima de su mínimo configurado.'
        }
        onRetry={() => void query.refetch()}
      >
        <Card className="overflow-hidden">
          <LowStockTable items={items} />
        </Card>
      </ReportQueryState>
    </div>
  )
}

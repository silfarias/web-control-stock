import { Card } from '@/components/ui/Card'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { ReportStatGrid } from '@/features/reports/components/ReportStatGrid'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useSalesReport } from '@/features/reports/hooks/use-reports'
import { formatMoney } from '@/lib/utils/format'

export function SalesReportPage() {
  const { filtro, values, setValues, clear } = useReportFilterParams('ventas')
  const query = useSalesReport(filtro)
  const data = query.data

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Resumen de ventas</h2>
        <p className="mt-1 text-sm text-muted">
          Totales de ventas confirmadas según los filtros aplicados.
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
        isEmpty={false}
        emptyTitle=""
        onRetry={() => void query.refetch()}
      >
        {data ? (
          <ReportStatGrid
            stats={[
              {
                label: 'Ventas',
                value: data.cantidadVentas,
                hint: 'Confirmadas en el período',
              },
              {
                label: 'Ingresos',
                value: formatMoney(data.totalIngresos),
              },
              {
                label: 'Unidades',
                value: data.unidadesVendidas,
              },
              {
                label: 'Ticket promedio',
                value: formatMoney(data.ticketPromedio),
              },
            ]}
          />
        ) : null}
      </ReportQueryState>
    </div>
  )
}

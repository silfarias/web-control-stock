import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PaymentMethodsTable } from '@/features/reports/components/PaymentMethodsTable'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { ReportScopeToggle } from '@/features/reports/components/ReportScopeToggle'
import { ReportStatGrid } from '@/features/reports/components/ReportStatGrid'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useSalesReport } from '@/features/reports/hooks/use-reports'
import { formatMoney } from '@/lib/utils/format'

export function SalesReportPage() {
  const { filtro, values, setValues, clear, productHint, reportEnabled, productPending, productBlocked } =
    useReportFilterParams('ventas')
  const query = useSalesReport(filtro, { enabled: reportEnabled })
  const data = query.data

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted">
          Totales de ventas confirmadas y desglose por método de pago según los filtros
          aplicados.
        </p>
        <ReportScopeToggle className="shrink-0" />
      </div>

      <Card className="p-4 sm:p-5">
        <ReportFiltersBar
          values={values}
          onChange={setValues}
          onClear={clear}
          showDates
          productHint={productHint}
        />
      </Card>

      {productBlocked ? null : (
        <ReportQueryState
          isLoading={productPending || query.isLoading}
          isError={query.isError}
          error={query.error}
          isEmpty={false}
          emptyTitle=""
          onRetry={() => void query.refetch()}
        >
        {data ? (
          <div className="space-y-5">
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

            <Card className="overflow-hidden pt-0">
              <CardHeader className="border-b border-border px-4 py-3.5 sm:px-5">
                <CardTitle>Por método de pago</CardTitle>
                <CardDescription>
                  Cantidad, unidades e ingresos de cada medio usado en el período.
                </CardDescription>
              </CardHeader>
              <PaymentMethodsTable items={data.porMetodoPago} />
            </Card>
          </div>
        ) : null}
        </ReportQueryState>
      )}
    </div>
  )
}

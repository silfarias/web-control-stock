import { Card } from '@/components/ui/Card'
import { InventoryReportTable } from '@/features/reports/components/InventoryReportTable'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { ReportQueryState } from '@/features/reports/components/ReportQueryState'
import { ReportScopeToggle } from '@/features/reports/components/ReportScopeToggle'
import { ReportStatGrid } from '@/features/reports/components/ReportStatGrid'
import { useReportFilterParams } from '@/features/reports/hooks/use-report-filter-params'
import { useInventoryReport } from '@/features/reports/hooks/use-reports'
import { hasActiveFilters } from '@/features/reports/utils/report-filters'
import { formatMoney } from '@/lib/utils/format'

export function InventoryReportPage() {
  const { filtro, values, setValues, clear, productHint, reportEnabled, productPending, productBlocked } =
    useReportFilterParams('catalogo')
  const query = useInventoryReport(filtro, { enabled: reportEnabled })
  const data = query.data
  const items = data?.items ?? []
  const filtered = hasActiveFilters(filtro, { ignoreLimite: true })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted">Stock actual valorizado a costo y a precio de venta.</p>
        <ReportScopeToggle className="shrink-0" />
      </div>

      <Card className="p-4 sm:p-5">
        <ReportFiltersBar
          values={values}
          onChange={setValues}
          onClear={clear}
          productHint={productHint}
        />
      </Card>

      {productBlocked ? null : (
        <ReportQueryState
          isLoading={productPending || query.isLoading}
          isError={query.isError}
          error={query.error}
          isEmpty={items.length === 0}
          emptyTitle={filtered ? 'Sin inventario para el filtro' : 'Sin stock registrado'}
          emptyDescription={
            filtered
              ? 'Probá otra categoría o código.'
              : 'Cuando haya productos con stock, verás la valorización aquí.'
          }
          onRetry={() => void query.refetch()}
        >
        {data ? (
          <div className="space-y-5">
            <ReportStatGrid
              stats={[
                {
                  label: 'Productos',
                  value: data.cantidadProductos,
                },
                {
                  label: 'Unidades',
                  value: data.unidadesTotales,
                },
                {
                  label: 'Valor a costo',
                  value: formatMoney(data.valorTotalCosto),
                },
                {
                  label: 'Valor a venta',
                  value: formatMoney(data.valorTotalVenta),
                },
              ]}
            />
            <Card className="overflow-hidden">
              <InventoryReportTable items={items} />
            </Card>
          </div>
        ) : null}
        </ReportQueryState>
      )}
    </div>
  )
}

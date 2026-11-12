import { useQuery } from '@tanstack/react-query'
import { reportKeys } from '@/features/reports/api/query-keys'
import { reportsApi } from '@/features/reports/api/reports-api'
import { useReportScope } from '@/features/reports/hooks/use-report-scope'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { FiltroReporte } from '@/features/reports/types'

type ReportQueryOptions = {
  enabled?: boolean
  /** Ignora `alcance=consolidado` y usa siempre la sucursal operativa (dashboard). */
  forceLocal?: boolean
}

function useResolvedReportScope(options?: ReportQueryOptions) {
  const reportScope = useReportScope()
  const { sucursalId, isReady } = useSucursal()

  if (options?.forceLocal) {
    return {
      scope: sucursalId ?? ('consolidated' as const),
      consolidated: false,
      enabled: isReady && (options.enabled ?? true),
    }
  }

  return {
    scope: reportScope.scope,
    consolidated: reportScope.consolidated,
    enabled: reportScope.enabled && (options?.enabled ?? true),
  }
}

export function useSalesReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  const { scope, consolidated, enabled } = useResolvedReportScope(options)

  return useQuery({
    queryKey: reportKeys.ventas(scope, filtro),
    queryFn: () => reportsApi.ventas(filtro, { consolidated }),
    enabled,
  })
}

export function useDailySalesReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  const { scope, consolidated, enabled } = useResolvedReportScope(options)

  return useQuery({
    queryKey: reportKeys.ventasDiario(scope, filtro),
    queryFn: () => reportsApi.ventasDiario(filtro, { consolidated }),
    enabled,
  })
}

export function useTopProductsReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  const { scope, consolidated, enabled } = useResolvedReportScope(options)

  return useQuery({
    queryKey: reportKeys.productosTop(scope, filtro),
    queryFn: () => reportsApi.productosTop(filtro, { consolidated }),
    enabled,
  })
}

export function useLowStockReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  const { scope, consolidated, enabled } = useResolvedReportScope(options)

  return useQuery({
    queryKey: reportKeys.stockBajo(scope, filtro),
    queryFn: () => reportsApi.stockBajo(filtro, { consolidated }),
    enabled,
  })
}

export function useInventoryReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  const { scope, consolidated, enabled } = useResolvedReportScope(options)

  return useQuery({
    queryKey: reportKeys.inventario(scope, filtro),
    queryFn: () => reportsApi.inventario(filtro, { consolidated }),
    enabled,
  })
}

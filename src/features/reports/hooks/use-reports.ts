import { useQuery } from '@tanstack/react-query'
import { reportKeys } from '@/features/reports/api/query-keys'
import { reportsApi } from '@/features/reports/api/reports-api'
import type { FiltroReporte } from '@/features/reports/types'

type ReportQueryOptions = {
  enabled?: boolean
}

export function useSalesReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  return useQuery({
    queryKey: reportKeys.ventas(filtro),
    queryFn: () => reportsApi.ventas(filtro),
    enabled: options?.enabled ?? true,
  })
}

export function useDailySalesReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  return useQuery({
    queryKey: reportKeys.ventasDiario(filtro),
    queryFn: () => reportsApi.ventasDiario(filtro),
    enabled: options?.enabled ?? true,
  })
}

export function useTopProductsReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  return useQuery({
    queryKey: reportKeys.productosTop(filtro),
    queryFn: () => reportsApi.productosTop(filtro),
    enabled: options?.enabled ?? true,
  })
}

export function useLowStockReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  return useQuery({
    queryKey: reportKeys.stockBajo(filtro),
    queryFn: () => reportsApi.stockBajo(filtro),
    enabled: options?.enabled ?? true,
  })
}

export function useInventoryReport(filtro: FiltroReporte, options?: ReportQueryOptions) {
  return useQuery({
    queryKey: reportKeys.inventario(filtro),
    queryFn: () => reportsApi.inventario(filtro),
    enabled: options?.enabled ?? true,
  })
}

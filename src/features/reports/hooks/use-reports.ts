import { useQuery } from '@tanstack/react-query'
import { reportKeys } from '@/features/reports/api/query-keys'
import { reportsApi } from '@/features/reports/api/reports-api'
import type { FiltroReporte } from '@/features/reports/types'

export function useSalesReport(filtro: FiltroReporte) {
  return useQuery({
    queryKey: reportKeys.ventas(filtro),
    queryFn: () => reportsApi.ventas(filtro),
  })
}

export function useDailySalesReport(filtro: FiltroReporte) {
  return useQuery({
    queryKey: reportKeys.ventasDiario(filtro),
    queryFn: () => reportsApi.ventasDiario(filtro),
  })
}

export function useTopProductsReport(filtro: FiltroReporte) {
  return useQuery({
    queryKey: reportKeys.productosTop(filtro),
    queryFn: () => reportsApi.productosTop(filtro),
  })
}

export function useLowStockReport(filtro: FiltroReporte) {
  return useQuery({
    queryKey: reportKeys.stockBajo(filtro),
    queryFn: () => reportsApi.stockBajo(filtro),
  })
}

export function useInventoryReport(filtro: FiltroReporte) {
  return useQuery({
    queryKey: reportKeys.inventario(filtro),
    queryFn: () => reportsApi.inventario(filtro),
  })
}

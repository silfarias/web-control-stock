import type { FiltroReporte } from '@/features/reports/types'

export type ReportScope = number | 'consolidated'

export const reportKeys = {
  all: ['reports'] as const,
  /** Prefijos para invalidar sin filtrar por query params. */
  ventasRoot: () => [...reportKeys.all, 'ventas'] as const,
  ventasDiarioRoot: () => [...reportKeys.all, 'ventas-diario'] as const,
  productosTopRoot: () => [...reportKeys.all, 'productos-top'] as const,
  stockBajoRoot: () => [...reportKeys.all, 'stock-bajo'] as const,
  inventarioRoot: () => [...reportKeys.all, 'inventario'] as const,
  ventas: (scope: ReportScope, filtro: FiltroReporte) =>
    [...reportKeys.ventasRoot(), scope, filtro] as const,
  ventasDiario: (scope: ReportScope, filtro: FiltroReporte) =>
    [...reportKeys.ventasDiarioRoot(), scope, filtro] as const,
  productosTop: (scope: ReportScope, filtro: FiltroReporte) =>
    [...reportKeys.productosTopRoot(), scope, filtro] as const,
  stockBajo: (scope: ReportScope, filtro: FiltroReporte) =>
    [...reportKeys.stockBajoRoot(), scope, filtro] as const,
  inventario: (scope: ReportScope, filtro: FiltroReporte) =>
    [...reportKeys.inventarioRoot(), scope, filtro] as const,
}

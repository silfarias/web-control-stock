import type { FiltroReporte } from '@/features/reports/types'

export const reportKeys = {
  all: ['reports'] as const,
  /** Prefijos para invalidar sin filtrar por query params. */
  ventasRoot: () => [...reportKeys.all, 'ventas'] as const,
  ventasDiarioRoot: () => [...reportKeys.all, 'ventas-diario'] as const,
  productosTopRoot: () => [...reportKeys.all, 'productos-top'] as const,
  stockBajoRoot: () => [...reportKeys.all, 'stock-bajo'] as const,
  inventarioRoot: () => [...reportKeys.all, 'inventario'] as const,
  ventas: (filtro: FiltroReporte) => [...reportKeys.ventasRoot(), filtro] as const,
  ventasDiario: (filtro: FiltroReporte) =>
    [...reportKeys.ventasDiarioRoot(), filtro] as const,
  productosTop: (filtro: FiltroReporte) =>
    [...reportKeys.productosTopRoot(), filtro] as const,
  stockBajo: (filtro: FiltroReporte) =>
    [...reportKeys.stockBajoRoot(), filtro] as const,
  inventario: (filtro: FiltroReporte) =>
    [...reportKeys.inventarioRoot(), filtro] as const,
}

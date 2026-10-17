import type { FiltroReporte } from '@/features/reports/types'

export const reportKeys = {
  all: ['reports'] as const,
  ventas: (filtro: FiltroReporte) => [...reportKeys.all, 'ventas', filtro] as const,
  ventasDiario: (filtro: FiltroReporte) =>
    [...reportKeys.all, 'ventas-diario', filtro] as const,
  productosTop: (filtro: FiltroReporte) =>
    [...reportKeys.all, 'productos-top', filtro] as const,
  stockBajo: (filtro: FiltroReporte) =>
    [...reportKeys.all, 'stock-bajo', filtro] as const,
  inventario: (filtro: FiltroReporte) =>
    [...reportKeys.all, 'inventario', filtro] as const,
}

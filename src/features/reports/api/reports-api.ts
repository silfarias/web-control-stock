import { apiClient } from '@/lib/api/client'
import type {
  FiltroReporte,
  ReporteInventario,
  ReporteProductoTopItem,
  ReporteStockBajoItem,
  ReporteVentas,
  ReporteVentasDiarioItem,
} from '@/features/reports/types'

function toQuery(filtro: FiltroReporte) {
  const query: Record<string, string | number> = {}
  if (filtro.desde) query.desde = filtro.desde
  if (filtro.hasta) query.hasta = filtro.hasta
  if (filtro.categoriaId != null) query.categoriaId = filtro.categoriaId
  if (filtro.productoId != null) query.productoId = filtro.productoId
  if (filtro.usuarioId != null) query.usuarioId = filtro.usuarioId
  if (filtro.limite != null) query.limite = filtro.limite
  return query
}

export const reportsApi = {
  ventas(filtro: FiltroReporte = {}) {
    return apiClient
      .get<ReporteVentas>('/reporte/ventas', { params: toQuery(filtro) })
      .then((response) => response.data)
  },

  ventasDiario(filtro: FiltroReporte = {}) {
    return apiClient
      .get<ReporteVentasDiarioItem[]>('/reporte/ventas/diario', {
        params: toQuery(filtro),
      })
      .then((response) => response.data)
  },

  productosTop(filtro: FiltroReporte = {}) {
    return apiClient
      .get<ReporteProductoTopItem[]>('/reporte/productos-top', {
        params: toQuery(filtro),
      })
      .then((response) => response.data)
  },

  stockBajo(filtro: FiltroReporte = {}) {
    return apiClient
      .get<ReporteStockBajoItem[]>('/reporte/stock-bajo', {
        params: toQuery(filtro),
      })
      .then((response) => response.data)
  },

  inventario(filtro: FiltroReporte = {}) {
    return apiClient
      .get<ReporteInventario>('/reporte/inventario', {
        params: toQuery(filtro),
      })
      .then((response) => response.data)
  },
}

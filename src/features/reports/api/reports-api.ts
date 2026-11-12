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
  if (filtro.fecha) {
    query.fecha = filtro.fecha
  } else {
    if (filtro.desde) query.desde = filtro.desde
    if (filtro.hasta) query.hasta = filtro.hasta
  }
  if (filtro.categoriaId != null) query.categoriaId = filtro.categoriaId
  if (filtro.productoId != null) query.productoId = filtro.productoId
  if (filtro.usuarioId != null) query.usuarioId = filtro.usuarioId
  if (filtro.limite != null) query.limite = filtro.limite
  return query
}

type ReportRequestOptions = {
  /** Sin header = consolidado de todas las sucursales (solo ADMIN). */
  consolidated?: boolean
}

function requestConfig(options?: ReportRequestOptions) {
  return options?.consolidated ? { skipSucursalHeader: true as const } : undefined
}

export const reportsApi = {
  ventas(filtro: FiltroReporte = {}, options?: ReportRequestOptions) {
    return apiClient
      .get<ReporteVentas>('/reporte/ventas', {
        params: toQuery(filtro),
        ...requestConfig(options),
      })
      .then((response) => response.data)
  },

  ventasDiario(filtro: FiltroReporte = {}, options?: ReportRequestOptions) {
    return apiClient
      .get<ReporteVentasDiarioItem[]>('/reporte/ventas/diario', {
        params: toQuery(filtro),
        ...requestConfig(options),
      })
      .then((response) => response.data)
  },

  productosTop(filtro: FiltroReporte = {}, options?: ReportRequestOptions) {
    return apiClient
      .get<ReporteProductoTopItem[]>('/reporte/productos-top', {
        params: toQuery(filtro),
        ...requestConfig(options),
      })
      .then((response) => response.data)
  },

  stockBajo(filtro: FiltroReporte = {}, options?: ReportRequestOptions) {
    return apiClient
      .get<ReporteStockBajoItem[]>('/reporte/stock-bajo', {
        params: toQuery(filtro),
        ...requestConfig(options),
      })
      .then((response) => response.data)
  },

  inventario(filtro: FiltroReporte = {}, options?: ReportRequestOptions) {
    return apiClient
      .get<ReporteInventario>('/reporte/inventario', {
        params: toQuery(filtro),
        ...requestConfig(options),
      })
      .then((response) => response.data)
  },
}

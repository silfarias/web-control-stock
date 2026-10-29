import type { MetodoPago } from '@/features/sales/types'

export type FiltroReporte = {
  /** Día exacto. Si viene, el backend ignora `desde` y `hasta`. */
  fecha?: string
  desde?: string
  hasta?: string
  categoriaId?: number
  productoId?: number
  usuarioId?: number
  limite?: number
}

export type ReporteVentasPorMetodoPago = {
  metodoPago: MetodoPago
  cantidadVentas: number
  totalIngresos: number
  unidadesVendidas: number
  porcentajeIngresos: number
}

export type ReporteVentas = {
  cantidadVentas: number
  totalIngresos: number
  unidadesVendidas: number
  ticketPromedio: number
  porMetodoPago: ReporteVentasPorMetodoPago[]
}

export type ReporteVentasDiarioItem = {
  fecha: string
  cantidadVentas: number
  totalIngresos: number
}

export type ReporteProductoTopItem = {
  productoId: number
  nombre: string
  codigo: string
  cantidadVendida: number
  totalVendido: number
}

export type ReporteStockBajoItem = {
  productoId: number
  nombre: string
  codigo: string
  cantidad: number
  minimoStock: number
  categoriaId: number
  categoriaNombre: string
}

export type ReporteInventarioItem = {
  productoId: number
  nombre: string
  codigo: string
  cantidad: number
  precioCosto: number
  precioVenta: number
  valorCosto: number
  valorVenta: number
}

export type ReporteInventario = {
  cantidadProductos: number
  unidadesTotales: number
  valorTotalCosto: number
  valorTotalVenta: number
  items: ReporteInventarioItem[]
}

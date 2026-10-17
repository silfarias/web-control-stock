import type { Producto } from '@/features/products/types'
import type { SearchParams } from '@/lib/api/types'

export type TipoMovimientoStock =
  | 'COMPRA'
  | 'VENTA'
  | 'AJUSTE_ENTRADA'
  | 'AJUSTE_SALIDA'

export type TipoReferenciaMovimiento = 'AJUSTE' | 'COMPRA' | 'VENTA' | 'OTRO'

export type Stock = {
  id: number
  cantidad: number
  /** Null si el producto fue eliminado del catálogo. */
  producto: Producto | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type SearchStockParams = SearchParams & {
  id?: number
  productoId?: number
}

export type MovimientoUsuario = {
  id: number
  nombre: string
  email: string
  role?: string
}

export type MovimientoStock = {
  id: number
  tipo: TipoMovimientoStock
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  tipoReferencia: TipoReferenciaMovimiento
  referenciaId?: number | null
  motivo: string
  descripcion?: string | null
  /** Null si el producto fue eliminado del catálogo. */
  producto: Producto | null
  usuario: MovimientoUsuario
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type SearchMovimientosParams = SearchParams & {
  id?: number
  productoId?: number
  tipo?: TipoMovimientoStock
  usuarioId?: number
}

export type StockStatus = 'ok' | 'low' | 'out' | 'unknown'

export type TipoAjusteStock = 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA'

export type CreateAjusteStockRequest = {
  productoId: number
  tipo: TipoAjusteStock
  cantidad: number
  motivo: string
  descripcion?: string
}

export type AjusteStockResponse = {
  stock: Stock
  movimiento: MovimientoStock
}

import type { Producto } from '@/features/products/types'
import type { Proveedor } from '@/features/suppliers/types'
import type { SearchParams } from '@/lib/api/types'

export type EstadoCompra = 'BORRADOR' | 'CONFIRMADA' | 'CANCELADA'

export type CompraUsuario = {
  id: number
  nombre: string
  email: string
  role?: string
}

export type ItemCompra = {
  id: number
  cantidad: number
  costoUnitario: number | string
  subtotal: number | string
  /** Null si el producto fue eliminado del catálogo. */
  producto: Producto | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type Compra = {
  id: number
  /** Comprobante visible. El detalle, editar, confirmar y cancelar siguen usando `id`. */
  numero: number
  total: number | string
  estado: EstadoCompra
  proveedor: Proveedor
  usuario: CompraUsuario
  items: ItemCompra[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type SearchComprasParams = SearchParams & {
  id?: number
  proveedorId?: number
  usuarioId?: number
  estado?: EstadoCompra
}

export type CreateItemCompraRequest = {
  productoId: number
  cantidad: number
  costoUnitario: number
}

export type CreateCompraRequest = {
  proveedorId: number
  items: CreateItemCompraRequest[]
}

export type UpdateCompraRequest = {
  proveedorId?: number
  items?: CreateItemCompraRequest[]
}

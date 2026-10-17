import type { Producto } from '@/features/products/types'
import type { SearchParams } from '@/lib/api/types'

export type MetodoPago =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'TARJETA_DEBITO'
  | 'TARJETA_CREDITO'
  | 'OTRO'

export type EstadoVenta = 'CONFIRMADA' | 'CANCELADA'

export type VentaUsuario = {
  id: number
  nombre: string
  email: string
  role?: string
}

export type ItemVenta = {
  id: number
  cantidad: number
  precioUnitario: number | string
  subtotal: number | string
  producto: Producto
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type Venta = {
  id: number
  total: number | string
  metodoPago: MetodoPago
  estado: EstadoVenta
  usuario: VentaUsuario
  items: ItemVenta[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type CreateItemVentaRequest = {
  productoId: number
  cantidad: number
}

export type CreateVentaRequest = {
  metodoPago: MetodoPago
  items: CreateItemVentaRequest[]
}

export type SearchVentasParams = SearchParams & {
  id?: number
  usuarioId?: number
  estado?: EstadoVenta
  metodoPago?: MetodoPago
}

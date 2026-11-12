import type { Producto } from '@/features/products/types'
import type { Sucursal } from '@/features/sucursales/types'
import type { SearchParams } from '@/lib/api/types'

export type EstadoTransferencia = 'BORRADOR' | 'CONFIRMADA' | 'CANCELADA'

export type TransferenciaUsuario = {
  id: number
  nombre: string
  email: string
  role?: string
}

export type ItemTransferencia = {
  id: number
  cantidad: number
  producto: Producto | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type Transferencia = {
  id: number
  /** Comprobante visible (numeración global). */
  numero: number
  estado: EstadoTransferencia
  sucursalOrigen: Sucursal
  sucursalDestino: Sucursal
  usuario: TransferenciaUsuario
  observacion?: string | null
  items: ItemTransferencia[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type SearchTransferenciasParams = SearchParams & {
  id?: number
  sucursalOrigenId?: number
  sucursalDestinoId?: number
  sucursalId?: number
  usuarioId?: number
  estado?: EstadoTransferencia
}

export type CreateItemTransferenciaRequest = {
  productoId: number
  cantidad: number
}

export type CreateTransferenciaRequest = {
  sucursalOrigenId: number
  sucursalDestinoId: number
  observacion?: string
  items: CreateItemTransferenciaRequest[]
}

export type UpdateTransferenciaRequest = {
  sucursalOrigenId?: number
  sucursalDestinoId?: number
  observacion?: string
  items?: CreateItemTransferenciaRequest[]
}

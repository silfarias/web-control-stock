import type { SearchParams } from '@/lib/api/types'

export type Proveedor = {
  id: number
  nombre: string
  cuit?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type CreateProveedorRequest = {
  nombre: string
  cuit?: string
  telefono?: string
  email?: string
  direccion?: string
  activo?: boolean
}

export type UpdateProveedorRequest = {
  nombre?: string
  cuit?: string
  telefono?: string
  email?: string
  direccion?: string
  activo?: boolean
}

export type SearchProveedoresParams = SearchParams & {
  id?: number
  nombre?: string
  activo?: boolean
}

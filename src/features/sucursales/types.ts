import type { SearchParams } from '@/lib/api/types'

export type Sucursal = {
  id: number
  nombre: string
  codigo: string
  direccion?: string | null
  telefono?: string | null
  activo: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type SucursalStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type CreateSucursalRequest = {
  nombre: string
  codigo: string
  direccion?: string
  telefono?: string
  activo?: boolean
}

export type UpdateSucursalRequest = {
  nombre?: string
  codigo?: string
  direccion?: string
  telefono?: string
  activo?: boolean
}

export type SearchSucursalesParams = SearchParams & {
  id?: number
  nombre?: string
  codigo?: string
  activo?: boolean
}

export type AssignUsuarioSucursalesRequest = {
  sucursalIds: number[]
}

export const CASA_CENTRAL_CODIGO = 'CASA-CENTRAL'

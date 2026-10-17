import type { UsuarioRole } from '@/features/auth/types'
import type { SearchParams } from '@/lib/api/types'

export type { UsuarioRole }

export type Usuario = {
  id: number
  nombre: string
  email: string
  role: UsuarioRole
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type SearchUsuariosParams = SearchParams & {
  id?: number
  nombre?: string
  email?: string
  role?: UsuarioRole
}

export type CreateUsuarioRequest = {
  nombre: string
  email: string
  password: string
  role: UsuarioRole
}

export type UpdateUsuarioRequest = {
  nombre?: string
  email?: string
  password?: string
  role?: UsuarioRole
}

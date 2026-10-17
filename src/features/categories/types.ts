import type { SearchParams } from '@/lib/api/types'

export type Categoria = {
  id: number
  nombre: string
  descripcion?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type CreateCategoriaRequest = {
  nombre: string
  descripcion?: string
}

export type UpdateCategoriaRequest = {
  nombre?: string
  descripcion?: string
}

export type SearchCategoriasParams = SearchParams & {
  id?: number
  nombre?: string
}

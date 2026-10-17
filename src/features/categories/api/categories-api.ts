import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  Categoria,
  CreateCategoriaRequest,
  SearchCategoriasParams,
  UpdateCategoriaRequest,
} from '@/features/categories/types'

function toQuery(params: SearchCategoriasParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.nombre?.trim()) query.nombre = params.nombre.trim()
  if (params.id != null) query.id = params.id
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const categoriesApi = {
  search(params: SearchCategoriasParams = {}) {
    return apiClient
      .get<PageDto<Categoria>>('/categoria/search', { params: toQuery(params) })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient.get<Categoria>(`/categoria/${id}`).then((response) => response.data)
  },

  create(payload: CreateCategoriaRequest) {
    return apiClient.post<Categoria>('/categoria', payload).then((response) => response.data)
  },

  update(id: number, payload: UpdateCategoriaRequest) {
    return apiClient
      .patch<Categoria>(`/categoria/${id}`, payload)
      .then((response) => response.data)
  },

  remove(id: number) {
    return apiClient.delete<string>(`/categoria/${id}`).then((response) => response.data)
  },
}

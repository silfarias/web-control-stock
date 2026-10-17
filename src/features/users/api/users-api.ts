import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  CreateUsuarioRequest,
  SearchUsuariosParams,
  UpdateUsuarioRequest,
  Usuario,
} from '@/features/users/types'

function toQuery(params: SearchUsuariosParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.nombre?.trim()) query.nombre = params.nombre.trim()
  if (params.email?.trim()) query.email = params.email.trim()
  if (params.role) query.role = params.role
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const usersApi = {
  search(params: SearchUsuariosParams = {}) {
    return apiClient
      .get<PageDto<Usuario>>('/usuario/search', { params: toQuery(params) })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient.get<Usuario>(`/usuario/${id}`).then((response) => response.data)
  },

  create(payload: CreateUsuarioRequest) {
    return apiClient.post<Usuario>('/usuario', payload).then((response) => response.data)
  },

  update(id: number, payload: UpdateUsuarioRequest) {
    return apiClient
      .patch<Usuario>(`/usuario/${id}`, payload)
      .then((response) => response.data)
  },

  remove(id: number) {
    return apiClient.delete<string>(`/usuario/${id}`).then((response) => response.data)
  },
}

import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  CreateProveedorRequest,
  Proveedor,
  SearchProveedoresParams,
  UpdateProveedorRequest,
} from '@/features/suppliers/types'

function toQuery(params: SearchProveedoresParams) {
  const query: Record<string, string | number | boolean> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.nombre?.trim()) query.nombre = params.nombre.trim()
  if (params.activo != null) query.activo = params.activo
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const suppliersApi = {
  search(params: SearchProveedoresParams = {}) {
    return apiClient
      .get<PageDto<Proveedor>>('/proveedor/search', { params: toQuery(params) })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient.get<Proveedor>(`/proveedor/${id}`).then((response) => response.data)
  },

  create(payload: CreateProveedorRequest) {
    return apiClient.post<Proveedor>('/proveedor', payload).then((response) => response.data)
  },

  update(id: number, payload: UpdateProveedorRequest) {
    return apiClient
      .patch<Proveedor>(`/proveedor/${id}`, payload)
      .then((response) => response.data)
  },

  remove(id: number) {
    return apiClient.delete<string>(`/proveedor/${id}`).then((response) => response.data)
  },
}

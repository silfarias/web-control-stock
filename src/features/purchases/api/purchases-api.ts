import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  Compra,
  CreateCompraRequest,
  SearchComprasParams,
  UpdateCompraRequest,
} from '@/features/purchases/types'

function toQuery(params: SearchComprasParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.proveedorId != null) query.proveedorId = params.proveedorId
  if (params.usuarioId != null) query.usuarioId = params.usuarioId
  if (params.estado) query.estado = params.estado
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const purchasesApi = {
  search(params: SearchComprasParams = {}) {
    return apiClient
      .get<PageDto<Compra>>('/compra/search', { params: toQuery(params) })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient.get<Compra>(`/compra/${id}`).then((response) => response.data)
  },

  create(payload: CreateCompraRequest) {
    return apiClient.post<Compra>('/compra', payload).then((response) => response.data)
  },

  update(id: number, payload: UpdateCompraRequest) {
    return apiClient.patch<Compra>(`/compra/${id}`, payload).then((response) => response.data)
  },

  confirm(id: number) {
    return apiClient.post<Compra>(`/compra/${id}/confirmar`).then((response) => response.data)
  },

  cancel(id: number) {
    return apiClient.post<Compra>(`/compra/${id}/cancelar`).then((response) => response.data)
  },

  remove(id: number) {
    return apiClient.delete<string>(`/compra/${id}`).then((response) => response.data)
  },
}

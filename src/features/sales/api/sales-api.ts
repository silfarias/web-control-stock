import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  CreateVentaRequest,
  SearchVentasParams,
  Venta,
} from '@/features/sales/types'

function toQuery(params: SearchVentasParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.usuarioId != null) query.usuarioId = params.usuarioId
  if (params.estado) query.estado = params.estado
  if (params.metodoPago) query.metodoPago = params.metodoPago
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const salesApi = {
  search(params: SearchVentasParams = {}) {
    return apiClient
      .get<PageDto<Venta>>('/venta/search', { params: toQuery(params) })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient.get<Venta>(`/venta/${id}`).then((response) => response.data)
  },

  create(payload: CreateVentaRequest) {
    return apiClient.post<Venta>('/venta', payload).then((response) => response.data)
  },
}

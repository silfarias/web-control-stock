import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  CreateTransferenciaRequest,
  SearchTransferenciasParams,
  Transferencia,
  UpdateTransferenciaRequest,
} from '@/features/transfers/types'

function toQuery(params: SearchTransferenciasParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.sucursalOrigenId != null) query.sucursalOrigenId = params.sucursalOrigenId
  if (params.sucursalDestinoId != null) query.sucursalDestinoId = params.sucursalDestinoId
  if (params.sucursalId != null) query.sucursalId = params.sucursalId
  if (params.usuarioId != null) query.usuarioId = params.usuarioId
  if (params.estado) query.estado = params.estado
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

/** Transferencias no usan `x-sucursal-id` (origen/destino van en el body). */
const noSucursalHeader = { skipSucursalHeader: true as const }

export const transfersApi = {
  search(params: SearchTransferenciasParams = {}) {
    return apiClient
      .get<PageDto<Transferencia>>('/transferencia/search', {
        params: toQuery(params),
        ...noSucursalHeader,
      })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient
      .get<Transferencia>(`/transferencia/${id}`, noSucursalHeader)
      .then((response) => response.data)
  },

  create(payload: CreateTransferenciaRequest) {
    return apiClient
      .post<Transferencia>('/transferencia', payload, noSucursalHeader)
      .then((response) => response.data)
  },

  update(id: number, payload: UpdateTransferenciaRequest) {
    return apiClient
      .patch<Transferencia>(`/transferencia/${id}`, payload, noSucursalHeader)
      .then((response) => response.data)
  },

  confirm(id: number) {
    return apiClient
      .post<Transferencia>(`/transferencia/${id}/confirmar`, undefined, noSucursalHeader)
      .then((response) => response.data)
  },

  cancel(id: number) {
    return apiClient
      .post<Transferencia>(`/transferencia/${id}/cancelar`, undefined, noSucursalHeader)
      .then((response) => response.data)
  },

  remove(id: number) {
    return apiClient
      .delete<string>(`/transferencia/${id}`, noSucursalHeader)
      .then((response) => response.data)
  },
}

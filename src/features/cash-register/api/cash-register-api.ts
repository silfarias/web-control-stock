import { apiClient } from '@/lib/api/client'
import { normalizeApiError } from '@/lib/api/errors'
import type { PageDto } from '@/lib/api/types'
import type {
  AbrirCajaRequest,
  Caja,
  CerrarCajaRequest,
  CierreCajaResponse,
  CreateMovimientoCajaRequest,
  MovimientoCaja,
  SearchCajasParams,
  SearchMovimientosCajaParams,
} from '@/features/cash-register/types'

function toCajaQuery(params: SearchCajasParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.usuarioId != null) query.usuarioId = params.usuarioId
  if (params.estado) query.estado = params.estado
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

function toMovimientoQuery(params: SearchMovimientosCajaParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.cajaId != null) query.cajaId = params.cajaId
  if (params.tipo) query.tipo = params.tipo
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const cashRegisterApi = {
  search(params: SearchCajasParams = {}) {
    return apiClient
      .get<PageDto<Caja>>('/caja/search', { params: toCajaQuery(params) })
      .then((response) => response.data)
  },

  /** Devuelve la caja abierta o `null` si no hay ninguna (404). */
  async getActiva(): Promise<Caja | null> {
    try {
      const response = await apiClient.get<Caja>('/caja/activa')
      return response.data
    } catch (error) {
      const apiError = normalizeApiError(error)
      if (apiError.status === 404) return null
      throw apiError
    }
  },

  getById(id: number) {
    return apiClient.get<Caja>(`/caja/${id}`).then((response) => response.data)
  },

  abrir(payload: AbrirCajaRequest) {
    return apiClient.post<Caja>('/caja/abrir', payload).then((response) => response.data)
  },

  cerrar(id: number, payload: CerrarCajaRequest) {
    return apiClient
      .post<CierreCajaResponse>(`/caja/${id}/cerrar`, payload)
      .then((response) => response.data)
  },

  searchMovimientos(params: SearchMovimientosCajaParams = {}) {
    return apiClient
      .get<PageDto<MovimientoCaja>>('/caja/movimientos/search', {
        params: toMovimientoQuery(params),
      })
      .then((response) => response.data)
  },

  searchMovimientosByCaja(cajaId: number, params: SearchMovimientosCajaParams = {}) {
    return apiClient
      .get<PageDto<MovimientoCaja>>(`/caja/${cajaId}/movimientos`, {
        params: toMovimientoQuery(params),
      })
      .then((response) => response.data)
  },

  createMovimiento(payload: CreateMovimientoCajaRequest) {
    return apiClient
      .post<MovimientoCaja>('/caja/movimientos', payload)
      .then((response) => response.data)
  },
}

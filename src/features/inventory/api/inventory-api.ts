import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  AjusteStockResponse,
  CreateAjusteStockRequest,
  MovimientoStock,
  SearchMovimientosParams,
  SearchStockParams,
  Stock,
} from '@/features/inventory/types'
import {
  requireSucursalId,
  sucursalRequestHeaders,
} from '@/features/sucursales/utils/require-sucursal-id'

type SucursalScopedOptions = {
  /** Fija `x-sucursal-id` (p. ej. stock del origen de una transferencia). */
  sucursalId?: number
}

function toStockQuery(params: SearchStockParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.productoId != null) query.productoId = params.productoId
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

function toMovementsQuery(params: SearchMovimientosParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.productoId != null) query.productoId = params.productoId
  if (params.tipo) query.tipo = params.tipo
  if (params.usuarioId != null) query.usuarioId = params.usuarioId
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

export const inventoryApi = {
  search(params: SearchStockParams = {}) {
    return apiClient
      .get<PageDto<Stock>>('/inventario/search', { params: toStockQuery(params) })
      .then((response) => response.data)
  },

  getByProductId(productoId: number, options?: SucursalScopedOptions) {
    return apiClient
      .get<Stock>(`/inventario/producto/${productoId}`, {
        headers:
          options?.sucursalId != null
            ? sucursalRequestHeaders(options.sucursalId)
            : undefined,
      })
      .then((response) => response.data)
  },

  searchMovements(params: SearchMovimientosParams = {}) {
    return apiClient
      .get<PageDto<MovimientoStock>>('/inventario/movimientos/search', {
        params: toMovementsQuery(params),
      })
      .then((response) => response.data)
  },

  getMovementsByProduct(productoId: number, params: SearchMovimientosParams = {}) {
    return apiClient
      .get<PageDto<MovimientoStock>>(`/inventario/producto/${productoId}/movimientos`, {
        params: toMovementsQuery(params),
      })
      .then((response) => response.data)
  },

  createAjuste(payload: CreateAjusteStockRequest) {
    const sucursalId = requireSucursalId()
    return apiClient
      .post<AjusteStockResponse>('/inventario/ajustes', payload, {
        headers: sucursalRequestHeaders(sucursalId),
      })
      .then((response) => response.data)
  },
}

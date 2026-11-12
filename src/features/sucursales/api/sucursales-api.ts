import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  AssignUsuarioSucursalesRequest,
  CreateSucursalRequest,
  SearchSucursalesParams,
  Sucursal,
  UpdateSucursalRequest,
} from '@/features/sucursales/types'

function toQuery(params: SearchSucursalesParams) {
  const query: Record<string, string | number | boolean> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.nombre?.trim()) query.nombre = params.nombre.trim()
  if (params.codigo?.trim()) query.codigo = params.codigo.trim()
  if (params.activo != null) query.activo = params.activo
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

const noSucursalHeader = { skipSucursalHeader: true as const }

export const sucursalesApi = {
  /** Sucursales activas operables por el usuario autenticado. */
  me() {
    return apiClient
      .get<Sucursal[]>('/sucursal/me', noSucursalHeader)
      .then((response) => response.data)
  },

  search(params: SearchSucursalesParams = {}) {
    return apiClient
      .get<PageDto<Sucursal>>('/sucursal/search', {
        params: toQuery(params),
        ...noSucursalHeader,
      })
      .then((response) => response.data)
  },

  getById(id: number) {
    return apiClient
      .get<Sucursal>(`/sucursal/${id}`, noSucursalHeader)
      .then((response) => response.data)
  },

  create(payload: CreateSucursalRequest) {
    return apiClient
      .post<Sucursal>('/sucursal', payload, noSucursalHeader)
      .then((response) => response.data)
  },

  update(id: number, payload: UpdateSucursalRequest) {
    return apiClient
      .patch<Sucursal>(`/sucursal/${id}`, payload, noSucursalHeader)
      .then((response) => response.data)
  },

  activar(id: number) {
    return apiClient
      .post<Sucursal>(`/sucursal/${id}/activar`, undefined, noSucursalHeader)
      .then((response) => response.data)
  },

  remove(id: number) {
    return apiClient
      .delete<string>(`/sucursal/${id}`, noSucursalHeader)
      .then((response) => response.data)
  },

  getAsignaciones(usuarioId: number) {
    return apiClient
      .get<Sucursal[]>(`/sucursal/usuario/${usuarioId}/asignaciones`, noSucursalHeader)
      .then((response) => response.data)
  },

  replaceAsignaciones(usuarioId: number, payload: AssignUsuarioSucursalesRequest) {
    return apiClient
      .put<Sucursal[]>(`/sucursal/usuario/${usuarioId}/asignaciones`, payload, noSucursalHeader)
      .then((response) => response.data)
  },
}

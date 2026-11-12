import { apiClient } from '@/lib/api/client'
import type { PageDto } from '@/lib/api/types'
import type {
  CreateProductoRequest,
  Producto,
  SearchProductosParams,
  UpdateProductoRequest,
} from '@/features/products/types'
import {
  requireSucursalId,
  sucursalRequestHeaders,
} from '@/features/sucursales/utils/require-sucursal-id'

function toQuery(params: SearchProductosParams) {
  const query: Record<string, string | number> = {}
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.id != null) query.id = params.id
  if (params.nombre?.trim()) query.nombre = params.nombre.trim()
  if (params.codigo?.trim()) query.codigo = params.codigo.trim()
  if (params.codigoBarras?.trim()) query.codigoBarras = params.codigoBarras.trim()
  if (params.categoriaId != null) query.categoriaId = params.categoriaId
  if (params.pageNumber != null) query.pageNumber = params.pageNumber
  if (params.pageSize != null) query.pageSize = params.pageSize
  if (params.orderBy) query.orderBy = params.orderBy
  if (params.orderDirection) query.orderDirection = params.orderDirection
  return query
}

type ProductReadOptions = {
  /** Fija `x-sucursal-id` para obtener `stockCantidad` de esa sucursal. */
  sucursalId?: number
}

export const productsApi = {
  search(params: SearchProductosParams = {}, options?: ProductReadOptions) {
    return apiClient
      .get<PageDto<Producto>>('/producto/search', {
        params: toQuery(params),
        headers:
          options?.sucursalId != null
            ? sucursalRequestHeaders(options.sucursalId)
            : undefined,
      })
      .then((response) => response.data)
  },

  getById(id: number, options?: ProductReadOptions) {
    return apiClient
      .get<Producto>(`/producto/${id}`, {
        headers:
          options?.sucursalId != null
            ? sucursalRequestHeaders(options.sucursalId)
            : undefined,
      })
      .then((response) => response.data)
  },

  create(payload: CreateProductoRequest) {
    const sucursalId = requireSucursalId()
    return apiClient
      .post<Producto>('/producto', payload, { headers: sucursalRequestHeaders(sucursalId) })
      .then((response) => response.data)
  },

  update(id: number, payload: UpdateProductoRequest) {
    return apiClient
      .patch<Producto>(`/producto/${id}`, payload)
      .then((response) => response.data)
  },

  remove(id: number) {
    return apiClient.delete<string>(`/producto/${id}`).then((response) => response.data)
  },
}

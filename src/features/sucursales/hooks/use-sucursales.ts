import { useQuery } from '@tanstack/react-query'
import { sucursalKeys } from '@/features/sucursales/api/query-keys'
import { sucursalesApi } from '@/features/sucursales/api/sucursales-api'
import type { SearchSucursalesParams } from '@/features/sucursales/types'

export function useSucursales(params: SearchSucursalesParams) {
  return useQuery({
    queryKey: sucursalKeys.list(params),
    queryFn: () => sucursalesApi.search(params),
  })
}

export function useSucursalDetail(id: number | undefined) {
  return useQuery({
    queryKey: sucursalKeys.detail(id ?? 0),
    queryFn: () => sucursalesApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

/** Catálogo completo para selectores de asignación (ADMIN). */
export function useAllSucursales(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: sucursalKeys.list({
      pageNumber: 1,
      pageSize: 200,
      orderBy: 'nombre',
      orderDirection: 'ASC',
    }),
    queryFn: () =>
      sucursalesApi.search({
        pageNumber: 1,
        pageSize: 200,
        orderBy: 'nombre',
        orderDirection: 'ASC',
      }),
    enabled: options?.enabled ?? true,
    select: (page) => page.data,
  })
}

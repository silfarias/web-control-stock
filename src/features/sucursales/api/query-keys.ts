import type { SearchSucursalesParams } from '@/features/sucursales/types'

export const sucursalKeys = {
  all: ['sucursales'] as const,
  me: () => [...sucursalKeys.all, 'me'] as const,
  lists: () => [...sucursalKeys.all, 'list'] as const,
  list: (params: SearchSucursalesParams) => [...sucursalKeys.lists(), params] as const,
  details: () => [...sucursalKeys.all, 'detail'] as const,
  detail: (id: number) => [...sucursalKeys.details(), id] as const,
  assignments: (usuarioId: number) =>
    [...sucursalKeys.all, 'assignments', usuarioId] as const,
}

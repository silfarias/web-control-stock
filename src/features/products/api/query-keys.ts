import type { SearchProductosParams } from '@/features/products/types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (sucursalId: number | null, params: SearchProductosParams) =>
    [...productKeys.lists(), sucursalId, params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (sucursalId: number | null, id: number) =>
    [...productKeys.details(), sucursalId, id] as const,
}

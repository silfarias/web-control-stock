import type { SearchComprasParams } from '@/features/purchases/types'

export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (params: SearchComprasParams) => [...purchaseKeys.lists(), params] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: number) => [...purchaseKeys.details(), id] as const,
}

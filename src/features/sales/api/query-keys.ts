import type { SearchVentasParams } from '@/features/sales/types'

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params: SearchVentasParams) => [...saleKeys.lists(), params] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: number) => [...saleKeys.details(), id] as const,
}

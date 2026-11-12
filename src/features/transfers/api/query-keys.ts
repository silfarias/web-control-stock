import type { SearchTransferenciasParams } from '@/features/transfers/types'

export const transferKeys = {
  all: ['transfers'] as const,
  lists: () => [...transferKeys.all, 'list'] as const,
  list: (params: SearchTransferenciasParams) =>
    [...transferKeys.lists(), params] as const,
  details: () => [...transferKeys.all, 'detail'] as const,
  detail: (id: number) => [...transferKeys.details(), id] as const,
}

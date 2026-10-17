import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { purchasesApi } from '@/features/purchases/api/purchases-api'
import { purchaseKeys } from '@/features/purchases/api/query-keys'
import type { SearchComprasParams } from '@/features/purchases/types'

export function usePurchases(params: SearchComprasParams) {
  return useQuery({
    queryKey: purchaseKeys.list(params),
    queryFn: () => purchasesApi.search(params),
    placeholderData: keepPreviousData,
  })
}

export function usePurchase(id: number | null) {
  return useQuery({
    queryKey: purchaseKeys.detail(id ?? 0),
    queryFn: () => purchasesApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

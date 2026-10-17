import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'
import type { SearchProductosParams } from '@/features/products/types'

export function useProducts(params: SearchProductosParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.search(params),
    placeholderData: keepPreviousData,
  })
}

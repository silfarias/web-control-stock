import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { salesApi } from '@/features/sales/api/sales-api'
import { saleKeys } from '@/features/sales/api/query-keys'
import type { SearchVentasParams } from '@/features/sales/types'

export function useSales(params: SearchVentasParams) {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => salesApi.search(params),
    placeholderData: keepPreviousData,
  })
}

export function useSale(id: number | null) {
  return useQuery({
    queryKey: saleKeys.detail(id ?? 0),
    queryFn: () => salesApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? 0),
    queryFn: () => productsApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

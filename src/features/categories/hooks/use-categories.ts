import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/features/categories/api/categories-api'
import { categoryKeys } from '@/features/categories/api/query-keys'
import type { SearchCategoriasParams } from '@/features/categories/types'

export function useCategories(params: SearchCategoriasParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.search(params),
    placeholderData: keepPreviousData,
  })
}

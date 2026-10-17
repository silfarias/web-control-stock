import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/features/categories/api/categories-api'
import { categoryKeys } from '@/features/categories/api/query-keys'
import type { Categoria } from '@/features/categories/types'

const OPTIONS_PAGE_SIZE = 100

async function fetchAllCategories(): Promise<Categoria[]> {
  const all: Categoria[] = []
  let pageNumber = 1

  while (true) {
    const page = await categoriesApi.search({
      pageNumber,
      pageSize: OPTIONS_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC',
    })
    all.push(...page.data)
    if (pageNumber >= page.metadata.totalPages || page.data.length === 0) break
    pageNumber += 1
  }

  return all
}

/** Lista completa de categorías para selectores (pagina hasta agotar resultados). */
export function useCategoryOptions() {
  return useQuery({
    queryKey: [...categoryKeys.all, 'options'] as const,
    queryFn: fetchAllCategories,
    staleTime: 60_000,
  })
}

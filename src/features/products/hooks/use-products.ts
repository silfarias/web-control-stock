import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { SearchProductosParams } from '@/features/products/types'

type UseProductsOptions = {
  enabled?: boolean
  /** Si se indica, consulta el catálogo con stock de esa sucursal (no la operativa). */
  sucursalId?: number | null
}

export function useProducts(params: SearchProductosParams, options?: UseProductsOptions) {
  const { sucursalId: operativeId, isReady } = useSucursal()
  const scopedId = options?.sucursalId !== undefined ? options.sucursalId : operativeId
  const enabled =
    (options?.enabled ?? true) &&
    (options?.sucursalId !== undefined
      ? options.sucursalId != null && options.sucursalId > 0
      : isReady)

  return useQuery({
    queryKey: productKeys.list(scopedId ?? null, params),
    queryFn: () =>
      productsApi.search(
        params,
        scopedId != null ? { sucursalId: scopedId } : undefined,
      ),
    placeholderData: keepPreviousData,
    enabled,
  })
}

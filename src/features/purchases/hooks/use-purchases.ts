import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { purchasesApi } from '@/features/purchases/api/purchases-api'
import { purchaseKeys } from '@/features/purchases/api/query-keys'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { SearchComprasParams } from '@/features/purchases/types'

export function usePurchases(params: SearchComprasParams) {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: purchaseKeys.list(sucursalId, params),
    queryFn: () => purchasesApi.search(params),
    placeholderData: keepPreviousData,
    enabled: isReady,
  })
}

export function usePurchase(id: number | null) {
  return useQuery({
    queryKey: purchaseKeys.detail(id ?? 0),
    queryFn: () => purchasesApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

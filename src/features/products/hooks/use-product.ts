import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'

export function useProduct(id: number | null) {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: productKeys.detail(sucursalId, id ?? 0),
    queryFn: () => productsApi.getById(id!),
    enabled: isReady && id != null && id > 0,
  })
}

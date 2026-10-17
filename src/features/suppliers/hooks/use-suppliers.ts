import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { suppliersApi } from '@/features/suppliers/api/suppliers-api'
import { supplierKeys } from '@/features/suppliers/api/query-keys'
import type { SearchProveedoresParams } from '@/features/suppliers/types'

export function useSuppliers(params: SearchProveedoresParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => suppliersApi.search(params),
    placeholderData: keepPreviousData,
  })
}

export function useSupplier(id: number | null) {
  return useQuery({
    queryKey: supplierKeys.detail(id ?? 0),
    queryFn: () => suppliersApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

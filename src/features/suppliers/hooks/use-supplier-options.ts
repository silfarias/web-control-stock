import { useQuery } from '@tanstack/react-query'
import { suppliersApi } from '@/features/suppliers/api/suppliers-api'
import { supplierKeys } from '@/features/suppliers/api/query-keys'
import type { Proveedor } from '@/features/suppliers/types'

const OPTIONS_PAGE_SIZE = 100

type SupplierOptionsParams = {
  /** Si se indica, filtra por estado activo en el servidor. */
  activo?: boolean
}

async function fetchAllSuppliers(params: SupplierOptionsParams = {}): Promise<Proveedor[]> {
  const all: Proveedor[] = []
  let pageNumber = 1

  while (true) {
    const page = await suppliersApi.search({
      pageNumber,
      pageSize: OPTIONS_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC',
      activo: params.activo,
    })
    all.push(...page.data)
    if (pageNumber >= page.metadata.totalPages || page.data.length === 0) break
    pageNumber += 1
  }

  return all
}

/** Lista completa de proveedores para selectores. */
export function useSupplierOptions(params: SupplierOptionsParams = {}) {
  return useQuery({
    queryKey: [...supplierKeys.all, 'options', params] as const,
    queryFn: () => fetchAllSuppliers(params),
    staleTime: 60_000,
  })
}

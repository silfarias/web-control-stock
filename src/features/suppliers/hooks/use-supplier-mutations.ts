import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseKeys } from '@/features/purchases/api/query-keys'
import { suppliersApi } from '@/features/suppliers/api/suppliers-api'
import { supplierKeys } from '@/features/suppliers/api/query-keys'
import type {
  CreateProveedorRequest,
  UpdateProveedorRequest,
} from '@/features/suppliers/types'

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProveedorRequest) => suppliersApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProveedorRequest }) =>
      suppliersApi.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) }),
        // Compras embeben datos del proveedor.
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: purchaseKeys.details() }),
      ])
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => suppliersApi.remove(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) }),
        queryClient.removeQueries({ queryKey: supplierKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: purchaseKeys.details() }),
      ])
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { purchasesApi } from '@/features/purchases/api/purchases-api'
import { purchaseKeys } from '@/features/purchases/api/query-keys'
import { reportKeys } from '@/features/reports/api/query-keys'
import type { CreateCompraRequest, UpdateCompraRequest } from '@/features/purchases/types'

export function useCreatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCompraRequest) => purchasesApi.create(payload),
    retry: false,
    onSuccess: async (purchase) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.setQueryData(purchaseKeys.detail(purchase.id), purchase),
      ])
    },
  })
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
      sucursalId,
    }: {
      id: number
      payload: UpdateCompraRequest
      sucursalId?: number
    }) => purchasesApi.update(id, payload, sucursalId),
    retry: false,
    onSuccess: async (purchase) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(purchase.id) }),
      ])
    },
  })
}

export function useConfirmPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, sucursalId }: { id: number; sucursalId?: number }) =>
      purchasesApi.confirm(id, sucursalId),
    retry: false,
    onSuccess: async (purchase) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.setQueryData(purchaseKeys.detail(purchase.id), purchase),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: reportKeys.stockBajoRoot() }),
        queryClient.invalidateQueries({ queryKey: reportKeys.inventarioRoot() }),
      ])
    },
  })
}

export function useCancelPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, sucursalId }: { id: number; sucursalId?: number }) =>
      purchasesApi.cancel(id, sucursalId),
    retry: false,
    onSuccess: async (purchase) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.setQueryData(purchaseKeys.detail(purchase.id), purchase),
      ])
    },
  })
}

export function useDeletePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, sucursalId }: { id: number; sucursalId?: number }) =>
      purchasesApi.remove(id, sucursalId),
    retry: false,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() }),
        queryClient.removeQueries({ queryKey: purchaseKeys.detail(variables.id) }),
      ])
    },
  })
}

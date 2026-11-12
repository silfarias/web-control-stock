import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { productKeys } from '@/features/products/api/query-keys'
import { reportKeys } from '@/features/reports/api/query-keys'
import { transferKeys } from '@/features/transfers/api/query-keys'
import { transfersApi } from '@/features/transfers/api/transfers-api'
import type {
  CreateTransferenciaRequest,
  UpdateTransferenciaRequest,
} from '@/features/transfers/types'

async function invalidateAfterConfirm(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: transferKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: reportKeys.stockBajoRoot() }),
    queryClient.invalidateQueries({ queryKey: reportKeys.inventarioRoot() }),
  ])
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransferenciaRequest) => transfersApi.create(payload),
    retry: false,
    onSuccess: async (transfer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transferKeys.lists() }),
        queryClient.setQueryData(transferKeys.detail(transfer.id), transfer),
      ])
    },
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTransferenciaRequest }) =>
      transfersApi.update(id, payload),
    retry: false,
    onSuccess: async (transfer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transferKeys.lists() }),
        queryClient.setQueryData(transferKeys.detail(transfer.id), transfer),
      ])
    },
  })
}

export function useConfirmTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transfersApi.confirm(id),
    retry: false,
    onSuccess: async (transfer) => {
      queryClient.setQueryData(transferKeys.detail(transfer.id), transfer)
      await invalidateAfterConfirm(queryClient)
    },
  })
}

export function useCancelTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transfersApi.cancel(id),
    retry: false,
    onSuccess: async (transfer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transferKeys.lists() }),
        queryClient.setQueryData(transferKeys.detail(transfer.id), transfer),
      ])
    },
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transfersApi.remove(id),
    retry: false,
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transferKeys.lists() }),
        queryClient.removeQueries({ queryKey: transferKeys.detail(id) }),
      ])
    },
  })
}

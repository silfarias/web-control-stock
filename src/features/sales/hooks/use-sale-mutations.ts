import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cashRegisterKeys } from '@/features/cash-register/api/query-keys'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { salesApi } from '@/features/sales/api/sales-api'
import { saleKeys } from '@/features/sales/api/query-keys'
import { normalizeApiError } from '@/lib/api/errors'
import type { CreateVentaRequest } from '@/features/sales/types'

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateVentaRequest) => salesApi.create(payload),
    retry: false,
    onSuccess: async (sale) => {
      queryClient.setQueryData(saleKeys.detail(sale.id), sale)

      const tasks = [
        queryClient.invalidateQueries({ queryKey: saleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
      ]

      if (sale.metodoPago === 'EFECTIVO') {
        tasks.push(
          queryClient.invalidateQueries({ queryKey: cashRegisterKeys.active() }),
          queryClient.invalidateQueries({ queryKey: cashRegisterKeys.movements() }),
          queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() }),
        )
      }

      await Promise.all(tasks)
    },
    onError: async (error) => {
      // Ante fallo de red el resultado puede ser incierto: refrescar listados sin reenviar.
      if (!normalizeApiError(error).isNetworkError) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: saleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.active() }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.movements() }),
      ])
    },
  })
}

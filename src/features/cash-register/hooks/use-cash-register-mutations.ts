import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cashRegisterApi } from '@/features/cash-register/api/cash-register-api'
import { cashRegisterKeys } from '@/features/cash-register/api/query-keys'
import type {
  AbrirCajaRequest,
  CerrarCajaRequest,
  CreateMovimientoCajaRequest,
} from '@/features/cash-register/types'
import { normalizeApiError } from '@/lib/api/errors'

export function useOpenCashRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AbrirCajaRequest) => cashRegisterApi.abrir(payload),
    retry: false,
    onSuccess: async (caja) => {
      queryClient.setQueryData(cashRegisterKeys.active(), caja)
      queryClient.setQueryData(cashRegisterKeys.detail(caja.id), caja)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.movements() }),
      ])
    },
  })
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CerrarCajaRequest }) =>
      cashRegisterApi.cerrar(id, payload),
    retry: false,
    onSuccess: async (result) => {
      queryClient.setQueryData(cashRegisterKeys.active(), null)
      queryClient.setQueryData(cashRegisterKeys.detail(result.caja.id), result.caja)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.movements() }),
      ])
    },
  })
}

export function useCreateCashMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMovimientoCajaRequest) =>
      cashRegisterApi.createMovimiento(payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.movements() }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.active() }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() }),
      ])
    },
    onError: async (error) => {
      if (!normalizeApiError(error).isNetworkError) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.movements() }),
        queryClient.invalidateQueries({ queryKey: cashRegisterKeys.active() }),
      ])
    },
  })
}

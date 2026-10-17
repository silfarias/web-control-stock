import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cashRegisterApi } from '@/features/cash-register/api/cash-register-api'
import { cashRegisterKeys } from '@/features/cash-register/api/query-keys'
import type {
  SearchCajasParams,
  SearchMovimientosCajaParams,
} from '@/features/cash-register/types'

export function useActiveCashRegister() {
  return useQuery({
    queryKey: cashRegisterKeys.active(),
    queryFn: () => cashRegisterApi.getActiva(),
  })
}

export function useCashRegisters(params: SearchCajasParams) {
  return useQuery({
    queryKey: cashRegisterKeys.list(params),
    queryFn: () => cashRegisterApi.search(params),
    placeholderData: keepPreviousData,
  })
}

export function useCashRegister(id: number | null) {
  return useQuery({
    queryKey: cashRegisterKeys.detail(id ?? 0),
    queryFn: () => cashRegisterApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

export function useCashMovements(params: SearchMovimientosCajaParams, enabled = true) {
  return useQuery({
    queryKey: cashRegisterKeys.movementList(params),
    queryFn: () => cashRegisterApi.searchMovimientos(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useCashMovementsByCaja(
  cajaId: number | null,
  params: SearchMovimientosCajaParams,
) {
  return useQuery({
    queryKey: cashRegisterKeys.movementsByCash(cajaId ?? 0, params),
    queryFn: () => cashRegisterApi.searchMovimientosByCaja(cajaId!, params),
    placeholderData: keepPreviousData,
    enabled: cajaId != null && cajaId > 0,
  })
}

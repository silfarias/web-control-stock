import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cashRegisterApi } from '@/features/cash-register/api/cash-register-api'
import { cashRegisterKeys } from '@/features/cash-register/api/query-keys'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type {
  SearchCajasParams,
  SearchMovimientosCajaParams,
} from '@/features/cash-register/types'

export function useActiveCashRegister() {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: cashRegisterKeys.active(sucursalId),
    queryFn: () => cashRegisterApi.getActiva(),
    enabled: isReady,
  })
}

export function useCashRegisters(params: SearchCajasParams, enabled = true) {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: cashRegisterKeys.list(sucursalId, params),
    queryFn: () => cashRegisterApi.search(params),
    placeholderData: keepPreviousData,
    enabled: isReady && enabled,
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
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: cashRegisterKeys.movementList(sucursalId, params),
    queryFn: () => cashRegisterApi.searchMovimientos(params),
    placeholderData: keepPreviousData,
    enabled: isReady && enabled,
  })
}

export function useCashMovementsByCaja(
  cajaId: number | null,
  params: SearchMovimientosCajaParams,
  enabled = true,
) {
  return useQuery({
    queryKey: cashRegisterKeys.movementsByCash(cajaId ?? 0, params),
    queryFn: () => cashRegisterApi.searchMovimientosByCaja(cajaId!, params),
    placeholderData: keepPreviousData,
    enabled: enabled && cajaId != null && cajaId > 0,
  })
}

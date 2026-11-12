import type {
  SearchCajasParams,
  SearchMovimientosCajaParams,
} from '@/features/cash-register/types'

export const cashRegisterKeys = {
  all: ['cash-register'] as const,
  active: (sucursalId: number | null) =>
    [...cashRegisterKeys.all, 'active', sucursalId] as const,
  lists: () => [...cashRegisterKeys.all, 'list'] as const,
  list: (sucursalId: number | null, params: SearchCajasParams) =>
    [...cashRegisterKeys.lists(), sucursalId, params] as const,
  details: () => [...cashRegisterKeys.all, 'detail'] as const,
  detail: (id: number) => [...cashRegisterKeys.details(), id] as const,
  movements: () => [...cashRegisterKeys.all, 'movements'] as const,
  movementLists: () => [...cashRegisterKeys.movements(), 'list'] as const,
  movementList: (sucursalId: number | null, params: SearchMovimientosCajaParams) =>
    [...cashRegisterKeys.movementLists(), sucursalId, params] as const,
  movementsByCash: (cajaId: number, params: SearchMovimientosCajaParams) =>
    [...cashRegisterKeys.movements(), 'caja', cajaId, params] as const,
}

import type {
  SearchCajasParams,
  SearchMovimientosCajaParams,
} from '@/features/cash-register/types'

export const cashRegisterKeys = {
  all: ['cash-register'] as const,
  active: () => [...cashRegisterKeys.all, 'active'] as const,
  lists: () => [...cashRegisterKeys.all, 'list'] as const,
  list: (params: SearchCajasParams) => [...cashRegisterKeys.lists(), params] as const,
  details: () => [...cashRegisterKeys.all, 'detail'] as const,
  detail: (id: number) => [...cashRegisterKeys.details(), id] as const,
  movements: () => [...cashRegisterKeys.all, 'movements'] as const,
  movementLists: () => [...cashRegisterKeys.movements(), 'list'] as const,
  movementList: (params: SearchMovimientosCajaParams) =>
    [...cashRegisterKeys.movementLists(), params] as const,
  movementsByCash: (cajaId: number, params: SearchMovimientosCajaParams) =>
    [...cashRegisterKeys.movements(), 'caja', cajaId, params] as const,
}

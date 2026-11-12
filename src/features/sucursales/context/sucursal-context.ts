import { createContext } from 'react'
import type { Sucursal, SucursalStatus } from '@/features/sucursales/types'

export type SucursalContextValue = {
  status: SucursalStatus
  sucursales: Sucursal[]
  sucursal: Sucursal | null
  sucursalId: number | null
  isReady: boolean
  isLoading: boolean
  error: string | null
  setSucursalId: (id: number) => void
  refetch: () => Promise<void>
}

export const SucursalContext = createContext<SucursalContextValue | null>(null)

import { useContext } from 'react'
import { SucursalContext } from '@/features/sucursales/context/sucursal-context'

export function useSucursal() {
  const context = useContext(SucursalContext)
  if (!context) {
    throw new Error('useSucursal debe usarse dentro de SucursalProvider.')
  }
  return context
}

/** Variante segura para componentes que pueden montarse fuera del provider. */
export function useOptionalSucursal() {
  return useContext(SucursalContext)
}

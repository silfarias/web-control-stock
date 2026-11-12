import { sucursalStore } from '@/features/sucursales/sucursal-store'

/** Fija la sucursal vigente al iniciar una mutación (evita cambios mid-flight). */
export function requireSucursalId(): number {
  const id = sucursalStore.getId()
  if (id == null) {
    throw new Error('No hay sucursal operativa seleccionada.')
  }
  return id
}

export function sucursalRequestHeaders(sucursalId: number) {
  return { 'x-sucursal-id': String(sucursalId) }
}

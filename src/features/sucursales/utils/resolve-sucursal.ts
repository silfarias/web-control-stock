import { CASA_CENTRAL_CODIGO, type Sucursal } from '@/features/sucursales/types'

export function pickInitialSucursal(
  available: Sucursal[],
  preferredId: number | null,
): Sucursal | null {
  if (available.length === 0) return null

  if (preferredId != null) {
    const preferred = available.find((item) => item.id === preferredId)
    if (preferred) return preferred
  }

  if (available.length === 1) return available[0]

  const casaCentral = available.find((item) => item.codigo === CASA_CENTRAL_CODIGO)
  return casaCentral ?? available[0]
}

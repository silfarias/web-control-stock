import type { AuthUsuario } from '@/features/auth/types'
import type { Caja } from '@/features/cash-register/types'

/** Ingresos/egresos manuales: solo ADMIN. */
export function canRegisterManualCashMovement(user: AuthUsuario | null | undefined) {
  return user?.role === 'ADMIN'
}

/**
 * Cierre de caja:
 * - ADMIN: cualquier caja abierta
 * - EMPLEADO: solo si la abrió él
 */
export function canCloseCashRegister(
  user: AuthUsuario | null | undefined,
  caja: Caja | null | undefined,
) {
  if (!user || !caja || caja.estado !== 'ABIERTA') return false
  if (user.role === 'ADMIN') return true
  return caja.usuario?.id === user.id
}

export function isCashOwnedByUser(
  user: AuthUsuario | null | undefined,
  caja: Caja | null | undefined,
) {
  if (!user || !caja) return false
  return caja.usuario?.id === user.id
}

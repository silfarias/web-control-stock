import type { AuthUsuario } from '@/features/auth/types'

type AuthFailureListener = () => void
type AuthClaimsStaleListener = () => void
type AuthUserSyncedListener = (user: AuthUsuario) => void

const invalidListeners = new Set<AuthFailureListener>()
const claimsStaleListeners = new Set<AuthClaimsStaleListener>()
const userSyncedListeners = new Set<AuthUserSyncedListener>()

export function onAuthSessionInvalid(listener: AuthFailureListener) {
  invalidListeners.add(listener)
  return () => {
    invalidListeners.delete(listener)
  }
}

export function notifyAuthSessionInvalid() {
  for (const listener of invalidListeners) {
    listener()
  }
}

/**
 * Señal de que el backend rechazó una acción por permisos (403).
 * No cierra sesión: el AuthProvider debe reconsultar GET /auth/me.
 */
export function onAuthClaimsStale(listener: AuthClaimsStaleListener) {
  claimsStaleListeners.add(listener)
  return () => {
    claimsStaleListeners.delete(listener)
  }
}

export function notifyAuthClaimsStale() {
  for (const listener of claimsStaleListeners) {
    listener()
  }
}

/** Usuario embebido en una respuesta de login/refresh exitosa. */
export function onAuthUserSynced(listener: AuthUserSyncedListener) {
  userSyncedListeners.add(listener)
  return () => {
    userSyncedListeners.delete(listener)
  }
}

export function notifyAuthUserSynced(user: AuthUsuario) {
  for (const listener of userSyncedListeners) {
    listener(user)
  }
}

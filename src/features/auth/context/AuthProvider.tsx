import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/auth-api'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/context/auth-context'
import type { AuthStatus, AuthUsuario, LoginRequest, LoginResponse } from '@/features/auth/types'
import {
  onAuthClaimsStale,
  onAuthSessionInvalid,
  onAuthUserSynced,
} from '@/lib/api/auth-events'
import { broadcastSessionCleared } from '@/lib/api/auth-sync'
import { refreshSession } from '@/lib/api/client'
import { normalizeApiError } from '@/lib/api/errors'
import { tokenStore } from '@/lib/api/token-store'

/** Evita ráfagas de GET /auth/me ante varios 403 seguidos. */
const RECONCILE_COOLDOWN_MS = 3_000
/** Reconsulta al volver a la pestaña, sin saturar. */
const VISIBILITY_RECONCILE_MIN_MS = 15_000

function applySession(data: LoginResponse) {
  tokenStore.setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  })
  return data.usuario
}

function toAuthUsuario(user: AuthUsuario): AuthUsuario {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  }
}

function isSameUserSnapshot(a: AuthUsuario | null, b: AuthUsuario) {
  if (!a) return false
  return (
    a.id === b.id &&
    a.role === b.role &&
    a.nombre === b.nombre &&
    a.email === b.email &&
    (a.updatedAt ?? null) === (b.updatedAt ?? null)
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [user, setUser] = useState<AuthUsuario | null>(null)
  const statusRef = useRef(status)
  const userRef = useRef<AuthUsuario | null>(null)
  const reconcileInFlight = useRef<Promise<void> | null>(null)
  const lastReconcileAt = useRef(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    userRef.current = user
  }, [user])

  const clearSession = useCallback(
    (options?: { broadcast?: boolean }) => {
      tokenStore.clear()
      userRef.current = null
      setUser(null)
      setStatus('anonymous')
      queryClient.clear()
      if (options?.broadcast !== false) {
        broadcastSessionCleared()
      }
    },
    [queryClient],
  )

  const applyAuthenticatedUser = useCallback(
    (nextRaw: AuthUsuario) => {
      const next = toAuthUsuario(nextRaw)
      const prev = userRef.current
      if (isSameUserSnapshot(prev, next)) {
        setStatus('authenticated')
        return next
      }
      if (prev && prev.role !== next.role) {
        // El menú y las pantallas dependen del rol en memoria; invalidar caché obsoleta.
        queryClient.clear()
      }
      userRef.current = next
      setUser(next)
      setStatus('authenticated')
      return next
    },
    [queryClient],
  )

  const loadCurrentUser = useCallback(async (): Promise<AuthUsuario> => {
    const me = await authApi.me()
    return applyAuthenticatedUser(me)
  }, [applyAuthenticatedUser])

  /**
   * Reconsulta GET /auth/me sin tratar un fallo genérico como logout.
   * Solo 401 limpia la sesión. Usado tras 403 o al recuperar el foco.
   */
  const reconcileCurrentUser = useCallback(async () => {
    if (statusRef.current !== 'authenticated') return
    if (!tokenStore.getAccessToken() && !tokenStore.getRefreshToken()) return

    if (reconcileInFlight.current) {
      await reconcileInFlight.current
      return
    }

    const elapsed = Date.now() - lastReconcileAt.current
    if (elapsed < RECONCILE_COOLDOWN_MS) return

    reconcileInFlight.current = (async () => {
      try {
        await loadCurrentUser()
      } catch (error) {
        const apiError = normalizeApiError(error)
        if (apiError.status === 401) {
          clearSession({ broadcast: true })
        }
      } finally {
        lastReconcileAt.current = Date.now()
        reconcileInFlight.current = null
      }
    })()

    await reconcileInFlight.current
  }, [clearSession, loadCurrentUser])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const refreshToken = tokenStore.getRefreshToken()
      if (!refreshToken) {
        if (!cancelled) {
          setStatus('anonymous')
        }
        return
      }

      try {
        // Un solo camino de refresh (mutex + coordinación entre pestañas).
        await refreshSession()
        if (cancelled) return

        try {
          const me = await authApi.me()
          if (cancelled) return
          applyAuthenticatedUser(me)
        } catch {
          if (cancelled) return
          clearSession({ broadcast: true })
        }
      } catch {
        if (cancelled) return
        clearSession({ broadcast: false })
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [applyAuthenticatedUser, clearSession])

  useEffect(() => {
    return onAuthSessionInvalid(() => {
      clearSession({ broadcast: false })
    })
  }, [clearSession])

  useEffect(() => {
    return onAuthClaimsStale(() => {
      void reconcileCurrentUser()
    })
  }, [reconcileCurrentUser])

  useEffect(() => {
    return onAuthUserSynced((next) => {
      if (statusRef.current !== 'authenticated' && statusRef.current !== 'bootstrapping') {
        return
      }
      applyAuthenticatedUser(next)
    })
  }, [applyAuthenticatedUser])

  useEffect(() => {
    if (typeof document === 'undefined') return

    function onVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      if (statusRef.current !== 'authenticated') return
      if (Date.now() - lastReconcileAt.current < VISIBILITY_RECONCILE_MIN_MS) return
      void reconcileCurrentUser()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reconcileCurrentUser])

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const data = await authApi.login(credentials)
      applySession(data)

      try {
        const me = await authApi.me()
        return applyAuthenticatedUser(me)
      } catch {
        return applyAuthenticatedUser(data.usuario)
      }
    },
    [applyAuthenticatedUser],
  )

  const logout = useCallback(async () => {
    try {
      // Logout del backend exige JWT válido; si el access venció, renovamos una vez.
      if (!tokenStore.getAccessToken() && tokenStore.getRefreshToken()) {
        try {
          await refreshSession()
        } catch {
          // Seguir con limpieza local.
        }
      }

      if (tokenStore.getAccessToken()) {
        await authApi.logout()
      }
    } catch {
      // Aunque falle la revocación remota, la limpieza local cierra la sesión en este cliente.
    } finally {
      clearSession({ broadcast: true })
    }
  }, [clearSession])

  /** Cierra sesión local sin llamar al backend (p. ej. tras revoke por cambio de contraseña). */
  const endSessionLocally = useCallback(async () => {
    clearSession({ broadcast: true })
  }, [clearSession])

  const syncUser = useCallback(
    (next: AuthUsuario) => {
      applyAuthenticatedUser(next)
    },
    [applyAuthenticatedUser],
  )

  const refreshUser = useCallback(async () => {
    if (!tokenStore.getAccessToken() && !tokenStore.getRefreshToken()) {
      clearSession({ broadcast: true })
      throw new Error('No hay sesión activa.')
    }
    try {
      return await loadCurrentUser()
    } catch (error) {
      clearSession({ broadcast: true })
      throw error
    }
  }, [clearSession, loadCurrentUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated' && user !== null,
      isBootstrapping: status === 'bootstrapping',
      login,
      logout,
      endSessionLocally,
      syncUser,
      refreshUser,
    }),
    [status, user, login, logout, endSessionLocally, syncUser, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

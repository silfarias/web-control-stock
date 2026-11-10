import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/auth-api'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/context/auth-context'
import type { AuthStatus, AuthUsuario, LoginRequest, LoginResponse } from '@/features/auth/types'
import { onAuthSessionInvalid } from '@/lib/api/auth-events'
import { broadcastSessionCleared } from '@/lib/api/auth-sync'
import { refreshSession } from '@/lib/api/client'
import { tokenStore } from '@/lib/api/token-store'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [user, setUser] = useState<AuthUsuario | null>(null)

  const clearSession = useCallback(
    (options?: { broadcast?: boolean }) => {
      tokenStore.clear()
      setUser(null)
      setStatus('anonymous')
      queryClient.clear()
      if (options?.broadcast !== false) {
        broadcastSessionCleared()
      }
    },
    [queryClient],
  )

  const loadCurrentUser = useCallback(async (): Promise<AuthUsuario> => {
    const me = await authApi.me()
    const next = toAuthUsuario(me)
    setUser(next)
    return next
  }, [])

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
          setUser(toAuthUsuario(me))
          setStatus('authenticated')
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
  }, [clearSession])

  useEffect(() => {
    return onAuthSessionInvalid(() => {
      clearSession({ broadcast: false })
    })
  }, [clearSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await authApi.login(credentials)
    applySession(data)

    try {
      const me = await authApi.me()
      const nextUser = toAuthUsuario(me)
      setUser(nextUser)
      setStatus('authenticated')
      return nextUser
    } catch {
      const nextUser = toAuthUsuario(data.usuario)
      setUser(nextUser)
      setStatus('authenticated')
      return nextUser
    }
  }, [])

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

  const syncUser = useCallback((next: AuthUsuario) => {
    setUser(toAuthUsuario(next))
  }, [])

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

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/auth-api'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/context/auth-context'
import type { AuthStatus, AuthUsuario, LoginRequest, LoginResponse } from '@/features/auth/types'
import { onAuthSessionInvalid } from '@/lib/api/auth-events'
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

  const clearSession = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setStatus('anonymous')
    queryClient.clear()
  }, [queryClient])

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
        const data = await authApi.refresh({ refresh_token: refreshToken })
        if (cancelled) return
        applySession(data)

        // Confirmar estado real en DB (rol, baja, etc.) con el access token renovado.
        try {
          const me = await authApi.me()
          if (cancelled) return
          setUser(toAuthUsuario(me))
          setStatus('authenticated')
        } catch {
          if (cancelled) return
          // Token válido pero usuario inexistente / inaccesible.
          tokenStore.clear()
          setUser(null)
          setStatus('anonymous')
          queryClient.clear()
        }
      } catch {
        if (cancelled) return
        tokenStore.clear()
        setUser(null)
        setStatus('anonymous')
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [queryClient])

  useEffect(() => {
    return onAuthSessionInvalid(() => {
      clearSession()
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
      // Fallback al payload de login si /me falla de forma transitoria.
      const nextUser = toAuthUsuario(data.usuario)
      setUser(nextUser)
      setStatus('authenticated')
      return nextUser
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (tokenStore.getAccessToken()) {
        await authApi.logout()
      }
    } catch {
      // La API no revoca tokens; la limpieza local es el cierre efectivo de sesión.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const syncUser = useCallback((next: AuthUsuario) => {
    setUser(toAuthUsuario(next))
  }, [])

  const refreshUser = useCallback(async () => {
    if (!tokenStore.getAccessToken() && !tokenStore.getRefreshToken()) {
      clearSession()
      throw new Error('No hay sesión activa.')
    }
    try {
      return await loadCurrentUser()
    } catch (error) {
      clearSession()
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
      syncUser,
      refreshUser,
    }),
    [status, user, login, logout, syncUser, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

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
        setUser(applySession(data))
        setStatus('authenticated')
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
  }, [])

  useEffect(() => {
    return onAuthSessionInvalid(() => {
      clearSession()
    })
  }, [clearSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await authApi.login(credentials)
    const nextUser = applySession(data)
    setUser(nextUser)
    setStatus('authenticated')
    return nextUser
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
    setUser(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated' && user !== null,
      isBootstrapping: status === 'bootstrapping',
      login,
      logout,
      syncUser,
    }),
    [status, user, login, logout, syncUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  notifyAuthClaimsStale,
  notifyAuthSessionInvalid,
  notifyAuthUserSynced,
} from '@/lib/api/auth-events'
import {
  broadcastRefreshing,
  broadcastSessionCleared,
  broadcastTokens,
  isRefreshLockBusy,
  onPeerSessionCleared,
  onPeerTokens,
  releaseRefreshLock,
  tryAcquireRefreshLock,
  waitForPeerTokens,
} from '@/lib/api/auth-sync'
import { normalizeApiError } from '@/lib/api/errors'
import { resolveSucursalHeaderMode } from '@/lib/api/sucursal-header'
import { tokenStore } from '@/lib/api/token-store'
import type { LoginResponse } from '@/features/auth/types'
import { sucursalStore } from '@/features/sucursales/sucursal-store'

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/signup', '/auth/seed-admin']

function getBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_URL
  if (typeof baseUrl !== 'string' || !baseUrl.trim()) {
    return 'http://localhost:3000'
  }
  return baseUrl.replace(/\/$/, '')
}

function isPublicAuthRequest(url?: string) {
  if (!url) return false
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20_000,
})

let refreshPromise: Promise<string> | null = null
let peerSyncInitialized = false

function ensurePeerSync() {
  if (peerSyncInitialized || typeof window === 'undefined') return
  peerSyncInitialized = true

  onPeerTokens((tokens) => {
    tokenStore.setTokens(tokens)
  })

  onPeerSessionCleared(() => {
    tokenStore.clear()
    notifyAuthSessionInvalid()
  })
}

async function performRefreshRequest(refreshToken: string): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(
    `${getBaseUrl()}/auth/refresh`,
    { refresh_token: refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20_000,
    },
  )
  return data
}

/**
 * Renueva access + refresh de forma única por pestaña y coordinada entre pestañas.
 * Cada refresh token del backend es de un solo uso.
 */
export async function refreshSession(): Promise<string> {
  ensurePeerSync()

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    let ownsLock = tryAcquireRefreshLock()

    if (!ownsLock) {
      try {
        const peerTokens = await waitForPeerTokens()
        tokenStore.setTokens(peerTokens)
        return peerTokens.accessToken
      } catch {
        // Si el peer ya sincronizó tokens vía listener global (carrera de suscripción),
        // reutilizarlos: NO volver a refrescar (invalidaría el refresh rotativo del peer).
        const syncedAccess = tokenStore.getAccessToken()
        if (syncedAccess && !isRefreshLockBusy()) {
          return syncedAccess
        }

        ownsLock = tryAcquireRefreshLock()
        if (!ownsLock) {
          // Último recurso: si hay access (aunque el lock siga ocupado), usarlo.
          if (syncedAccess) return syncedAccess
          throw normalizeApiError(new Error('No se pudo renovar la sesión.'))
        }
      }
    }

    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      releaseRefreshLock()
      throw normalizeApiError(new Error('No hay sesión activa.'))
    }

    broadcastRefreshing()

    try {
      const data = await performRefreshRequest(refreshToken)
      const tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      }
      tokenStore.setTokens(tokens)
      broadcastTokens(tokens)
      if (data.usuario) {
        notifyAuthUserSynced(data.usuario)
      }
      return tokens.accessToken
    } catch (error) {
      tokenStore.clear()
      broadcastSessionCleared()
      throw normalizeApiError(error)
    } finally {
      releaseRefreshLock()
    }
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  ensurePeerSync()

  if (isPublicAuthRequest(config.url)) {
    return config
  }

  const accessToken = tokenStore.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (config.skipSucursalHeader) {
    if (config.headers) {
      delete config.headers['x-sucursal-id']
      delete config.headers['X-Sucursal-Id']
    }
  } else {
    const mode = resolveSucursalHeaderMode(config.method, config.url)
    const pinned =
      config.headers?.['x-sucursal-id'] ?? config.headers?.['X-Sucursal-Id']
    const sucursalId = pinned != null && pinned !== '' ? pinned : sucursalStore.getId()
    if ((mode === 'required' || mode === 'optional') && sucursalId != null) {
      config.headers['x-sucursal-id'] = String(sucursalId)
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    // 403 = sin permiso: no renovar tokens; pedir reconciliación de rol vía /auth/me.
    if (status === 403 && config && !isPublicAuthRequest(config.url)) {
      const url = config.url ?? ''
      if (!url.includes('/auth/me')) {
        notifyAuthClaimsStale()
      }
      throw normalizeApiError(error)
    }

    // Solo 401 dispara renovación.
    if (!config || status !== 401 || config._retry || isPublicAuthRequest(config.url)) {
      throw normalizeApiError(error)
    }

    config._retry = true

    try {
      const accessToken = await refreshSession()
      config.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(config)
    } catch (refreshError) {
      tokenStore.clear()
      notifyAuthSessionInvalid()
      throw normalizeApiError(refreshError)
    }
  },
)

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { notifyAuthSessionInvalid } from '@/lib/api/auth-events'
import { normalizeApiError } from '@/lib/api/errors'
import { tokenStore } from '@/lib/api/token-store'
import type { LoginResponse } from '@/features/auth/types'

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

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) {
    throw normalizeApiError(new Error('No hay sesión activa.'))
  }

  const { data } = await axios.post<LoginResponse>(
    `${getBaseUrl()}/auth/refresh`,
    { refresh_token: refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20_000,
    },
  )

  tokenStore.setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  })

  return data.access_token
}

apiClient.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    return config
  }

  const accessToken = tokenStore.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (!config || status !== 401 || config._retry || isPublicAuthRequest(config.url)) {
      throw normalizeApiError(error)
    }

    config._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const accessToken = await refreshPromise
      config.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(config)
    } catch (refreshError) {
      tokenStore.clear()
      notifyAuthSessionInvalid()
      throw normalizeApiError(refreshError)
    }
  },
)

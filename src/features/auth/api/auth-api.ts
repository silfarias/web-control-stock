import { apiClient } from '@/lib/api/client'
import type {
  AuthUsuario,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenRequest,
} from '@/features/auth/types'

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<LoginResponse>('/auth/login', payload).then((response) => response.data)
  },

  refresh(payload: RefreshTokenRequest) {
    return apiClient
      .post<LoginResponse>('/auth/refresh', payload)
      .then((response) => response.data)
  },

  me() {
    return apiClient.get<AuthUsuario>('/auth/me').then((response) => response.data)
  },

  logout() {
    return apiClient.post<LogoutResponse>('/auth/logout').then((response) => response.data)
  },
}

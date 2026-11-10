import { createContext } from 'react'
import type {
  AuthStatus,
  AuthUsuario,
  LoginRequest,
} from '@/features/auth/types'

export type AuthContextValue = {
  status: AuthStatus
  user: AuthUsuario | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (credentials: LoginRequest) => Promise<AuthUsuario>
  logout: () => Promise<void>
  /**
   * Limpia tokens y caché local sin llamar a POST /auth/logout.
   * Usar cuando el backend ya revocó la sesión (p. ej. cambio de contraseña).
   */
  endSessionLocally: () => Promise<void>
  /** Actualiza datos del usuario autenticado sin tocar tokens (p. ej. tras editar el propio perfil). */
  syncUser: (next: AuthUsuario) => void
  /** Recupera el usuario actual vía GET /auth/me (tokens vigentes). */
  refreshUser: () => Promise<AuthUsuario>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

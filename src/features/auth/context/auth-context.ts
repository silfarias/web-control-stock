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
  /** Actualiza datos del usuario autenticado sin tocar tokens (p. ej. tras editar el propio perfil). */
  syncUser: (next: AuthUsuario) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

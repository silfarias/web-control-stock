export type UsuarioRole = 'ADMIN' | 'EMPLEADO'

export type AuthUsuario = {
  id: number
  nombre: string
  email: string
  role: UsuarioRole
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  access_token: string
  refresh_token: string
  expires_in: string
  usuario: AuthUsuario
}

export type RefreshTokenRequest = {
  refresh_token: string
}

export type LogoutResponse = {
  message: string
}

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous'

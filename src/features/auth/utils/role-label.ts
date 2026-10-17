import type { UsuarioRole } from '@/features/auth/types'

const labels: Record<UsuarioRole, string> = {
  ADMIN: 'Administrador',
  EMPLEADO: 'Empleado',
}

export function getRoleLabel(role: UsuarioRole) {
  return labels[role] ?? role
}

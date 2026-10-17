import { Badge } from '@/components/ui/Badge'
import { getRoleLabel } from '@/features/auth/utils/role-label'
import type { UsuarioRole } from '@/features/users/types'

type UserRoleBadgeProps = {
  role: UsuarioRole
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <Badge tone={role === 'ADMIN' ? 'info' : 'neutral'}>{getRoleLabel(role)}</Badge>
  )
}

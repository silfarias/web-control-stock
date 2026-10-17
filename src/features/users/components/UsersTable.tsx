import { Link } from 'react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge'
import type { Usuario } from '@/features/users/types'
import { formatDateTime } from '@/lib/utils/format'

type UsersTableProps = {
  users: Usuario[]
  currentUserId?: number
  onEdit: (user: Usuario) => void
  onDelete: (user: Usuario) => void
}

export function UsersTable({ users, currentUserId, onEdit, onDelete }: UsersTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listado de usuarios</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Email
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Rol
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Alta
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = currentUserId === user.id
              return (
                <tr key={user.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3.5 sm:px-5">
                    <Link
                      to={`/usuarios/${user.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {user.nombre}
                    </Link>
                    {isSelf ? (
                      <span className="mt-0.5 block text-xs text-muted">Vos</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <span className="break-all text-muted">{user.email}</span>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted sm:px-5">
                    {user.createdAt ? formatDateTime(user.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        aria-label={`Editar ${user.nombre}`}
                        onClick={() => onEdit(user)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-error-ink hover:bg-error-soft"
                        aria-label={`Eliminar ${user.nombre}`}
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

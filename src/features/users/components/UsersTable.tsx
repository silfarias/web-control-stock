import { Link } from 'react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
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
      <Table className="min-w-[48rem]">
        <TableCaption className="sr-only">Listado de usuarios</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Alta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = currentUserId === user.id
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    to={`/usuarios/${user.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {user.nombre}
                  </Link>
                  {isSelf ? <span className="mt-0.5 block text-xs text-muted">Vos</span> : null}
                </TableCell>
                <TableCell>
                  <span className="break-all text-muted">{user.email}</span>
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted">
                  {user.createdAt ? formatDateTime(user.createdAt) : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

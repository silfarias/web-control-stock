import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Pencil, Trash2, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge'
import { useUser } from '@/features/users/hooks/use-user'
import {
  useDeleteUser,
  useUpdateUser,
} from '@/features/users/hooks/use-user-mutations'
import {
  toUpdateUsuarioRequest,
  type EditUserFormValues,
} from '@/features/users/schemas/user-schema'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatDateTime } from '@/lib/utils/format'

export function UserDetailPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const { user: authUser, refreshUser, logout } = useAuth()
  const { pushToast } = useToast()

  const userQuery = useUser(Number.isFinite(id) && id > 0 ? id : undefined)
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const user = userQuery.data
  const isSelf = user != null && authUser?.id === user.id

  async function handleEdit(values: EditUserFormValues) {
    if (!user) return
    const updated = await updateMutation.mutateAsync({
      id: user.id,
      payload: toUpdateUsuarioRequest(values),
    })

    if (authUser?.id === updated.id) {
      try {
        await refreshUser()
      } catch {
        return
      }
    }

    pushToast({
      title: 'Usuario actualizado',
      description: `Se guardaron los cambios de ${updated.nombre}.`,
      tone: 'success',
    })
  }

  async function handleDelete() {
    if (!user) return
    try {
      await deleteMutation.mutateAsync(user.id)
      setDeleteOpen(false)
      pushToast({
        title: 'Usuario eliminado',
        description: `${user.nombre} fue dado de baja.`,
        tone: 'success',
      })
      if (isSelf) {
        await logout()
        return
      }
      void navigate('/usuarios', { replace: true })
    } catch (error) {
      pushToast({
        title: 'No se pudo eliminar',
        description: getApiErrorMessage(error),
        tone: 'error',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/usuarios"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver
        </Link>
      </div>

      {userQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando usuario…</p>
        </Card>
      ) : null}

      {userQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <EmptyState
            icon={Users}
            title="No se pudo cargar el usuario"
            description={getApiErrorMessage(userQuery.error)}
            action={
              <Button
                type="button"
                variant="outline"
                className="bg-surface"
                onClick={() => void userQuery.refetch()}
              >
                Reintentar
              </Button>
            }
          />
        </Card>
      ) : null}

      {!userQuery.isLoading && !userQuery.isError && !user ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Usuario no encontrado"
            description="El registro no existe o fue eliminado."
            action={
              <Link to="/usuarios" className={cn(buttonVariants({ variant: 'outline' }))}>
                Ir al listado
              </Link>
            }
          />
        </Card>
      ) : null}

      {user ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {user.nombre}
                </h1>
                <UserRoleBadge role={user.role} />
                {isSelf ? (
                  <span className="text-xs font-medium text-muted">(tu cuenta)</span>
                ) : null}
              </div>
              <p className="mt-1 break-all text-sm text-muted">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(true)}>
                <Pencil className="size-4" aria-hidden />
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-error-ink hover:bg-error-soft"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" aria-hidden />
                Eliminar
              </Button>
            </div>
          </div>

          <Card className="divide-y divide-border">
            <DetailRow label="ID" value={String(user.id)} />
            <DetailRow label="Nombre" value={user.nombre} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Rol" value={<UserRoleBadge role={user.role} />} />
            <DetailRow
              label="Creado"
              value={user.createdAt ? formatDateTime(user.createdAt) : '—'}
            />
            <DetailRow
              label="Actualizado"
              value={user.updatedAt ? formatDateTime(user.updatedAt) : '—'}
            />
          </Card>

          <UserFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            user={user}
            isSelf={isSelf}
            submitting={updateMutation.isPending}
            onSubmitEdit={handleEdit}
          />

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Eliminar usuario"
            description={
              isSelf
                ? `Vas a eliminar tu propia cuenta (${user.email}). Se cerrará la sesión al confirmar.`
                : `Se dará de baja a ${user.nombre} (${user.email}).`
            }
            confirmLabel="Eliminar"
            tone="danger"
            loading={deleteMutation.isPending}
            onConfirm={() => void handleDelete()}
          />
        </>
      ) : null}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">{label}</dt>
      <dd className="text-sm font-medium break-all">{value}</dd>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { UsersTable } from '@/features/users/components/UsersTable'
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from '@/features/users/hooks/use-user-mutations'
import { useUsers } from '@/features/users/hooks/use-users'
import {
  toCreateUsuarioRequest,
  toUpdateUsuarioRequest,
  type CreateUserFormValues,
  type EditUserFormValues,
} from '@/features/users/schemas/user-schema'
import type { Usuario, UsuarioRole } from '@/features/users/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
)

export function UsersPage() {
  const { user: authUser, refreshUser, logout } = useAuth()
  const { pushToast } = useToast()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UsuarioRole>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPageNumber(1)
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC' as const,
    }),
    [debouncedSearch, roleFilter, pageNumber],
  )

  const usersQuery = useUsers(params)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const users = usersQuery.data?.data ?? []
  const metadata = usersQuery.data?.metadata
  const hasFilters = Boolean(debouncedSearch) || roleFilter !== 'all'
  const isEmpty = !usersQuery.isLoading && users.length === 0 && !hasFilters
  const isFilteredEmpty =
    !usersQuery.isLoading && users.length === 0 && hasFilters

  function openCreate() {
    setEditingUser(null)
    setFormOpen(true)
  }

  function openEdit(user: Usuario) {
    setEditingUser(user)
    setFormOpen(true)
  }

  async function handleCreate(values: CreateUserFormValues) {
    const created = await createMutation.mutateAsync(toCreateUsuarioRequest(values))
    pushToast({
      title: 'Usuario creado',
      description: `${created.nombre} ya puede iniciar sesión.`,
      tone: 'success',
    })
  }

  async function handleEdit(values: EditUserFormValues) {
    if (!editingUser) return
    const updated = await updateMutation.mutateAsync({
      id: editingUser.id,
      payload: toUpdateUsuarioRequest(values),
    })

    if (authUser?.id === updated.id) {
      // GET /auth/me refleja rol/perfil actuales; limpia sesión si la cuenta ya no es válida.
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
    if (!deletingUser) return
    const target = deletingUser
    const isSelf = authUser?.id === target.id

    try {
      await deleteMutation.mutateAsync(target.id)
      setDeletingUser(null)
      pushToast({
        title: 'Usuario eliminado',
        description: `${target.nombre} fue dado de baja.`,
        tone: 'success',
      })
      if (isSelf) {
        await logout()
      }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 max-w-2xl text-sm text-muted">
          Alta y administración de cuentas con roles Administrador y Empleado.
        </p>
        <Button type="button" className="shrink-0 self-start" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Nuevo usuario
        </Button>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder="Buscar por nombre o email…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar usuarios"
            />
          </div>
          <label className="flex w-full items-center gap-2.5 text-sm sm:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">Rol</span>
            <select
              className={cn(selectClassName, 'min-w-0 sm:w-44')}
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as 'all' | UsuarioRole)
                setPageNumber(1)
              }}
              aria-label="Filtrar por rol"
            >
              <option value="all">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="EMPLEADO">Empleado</option>
            </select>
          </label>
        </div>
      </Card>

      {usersQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando usuarios…</p>
        </Card>
      ) : null}

      {usersQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudieron cargar los usuarios</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(usersQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void usersQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {isEmpty ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Todavía no hay usuarios"
            description="Creá el primer usuario para que pueda operar en el sistema."
            action={
              <Button type="button" onClick={openCreate}>
                <Plus className="size-4" aria-hidden />
                Nuevo usuario
              </Button>
            }
          />
        </Card>
      ) : null}

      {isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="Probá con otro término o quitá el filtro de rol."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('')
                  setRoleFilter('all')
                }}
              >
                Limpiar filtros
              </Button>
            }
          />
        </Card>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
        <>
          <UsersTable
            users={users}
            currentUserId={authUser?.id}
            onEdit={openEdit}
            onDelete={setDeletingUser}
          />
          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'usuario', plural: 'usuarios' }}
              disabled={usersQuery.isFetching}
              onPageChange={setPageNumber}
            />
          ) : null}
        </>
      ) : null}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        isSelf={editingUser != null && authUser?.id === editingUser.id}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleEdit}
      />

      <ConfirmDialog
        open={deletingUser != null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
        title="Eliminar usuario"
        description={
          deletingUser
            ? authUser?.id === deletingUser.id
              ? `Vas a eliminar tu propia cuenta (${deletingUser.email}). Se cerrará la sesión al confirmar. Esta acción no se puede deshacer desde la interfaz.`
              : `Se dará de baja a ${deletingUser.nombre} (${deletingUser.email}). El email quedará liberado para reutilizarse.`
            : ''
        }
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Building2, Save } from 'lucide-react'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAllSucursales } from '@/features/sucursales/hooks/use-sucursales'
import {
  useReplaceUserSucursalAssignments,
  useUserSucursalAssignments,
} from '@/features/sucursales/hooks/use-user-sucursal-assignments'
import type { Sucursal } from '@/features/sucursales/types'
import type { Usuario } from '@/features/users/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type UserSucursalAssignmentsProps = {
  user: Usuario
}

export function UserSucursalAssignments({ user }: UserSucursalAssignmentsProps) {
  if (user.role !== 'EMPLEADO') {
    return (
      <Card className="px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-muted text-primary">
            <Building2 className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight">Sucursales asignadas</h2>
            <p className="mt-1 text-sm text-muted">
              Los administradores pueden operar en cualquier sucursal activa. No requieren
              asignación.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return <EmployeeSucursalAssignments key={user.id} user={user} />
}

function EmployeeSucursalAssignments({ user }: { user: Usuario }) {
  const catalogQuery = useAllSucursales()
  const assignmentsQuery = useUserSucursalAssignments(user.id)

  const loading = catalogQuery.isLoading || assignmentsQuery.isLoading
  const error = catalogQuery.isError || assignmentsQuery.isError
  const errorMessage = catalogQuery.isError
    ? getApiErrorMessage(catalogQuery.error)
    : assignmentsQuery.isError
      ? getApiErrorMessage(assignmentsQuery.error)
      : null

  if (loading) {
    return (
      <Card className="px-5 py-8 text-center">
        <p className="text-sm text-muted">Cargando sucursales…</p>
      </Card>
    )
  }

  if (error || !assignmentsQuery.data || !catalogQuery.data) {
    return (
      <Card className="px-5 py-8 text-center">
        <p className="text-sm font-medium text-error-ink">
          No se pudieron cargar las asignaciones
        </p>
        <p className="mt-1 text-sm text-error-ink/90">{errorMessage}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            void catalogQuery.refetch()
            void assignmentsQuery.refetch()
          }}
        >
          Reintentar
        </Button>
      </Card>
    )
  }

  return (
    <AssignmentsEditor
      key={`${user.id}-${assignmentsQuery.dataUpdatedAt}`}
      user={user}
      catalog={catalogQuery.data}
      initialIds={assignmentsQuery.data.map((item) => item.id)}
    />
  )
}

type AssignmentsEditorProps = {
  user: Usuario
  catalog: Sucursal[]
  initialIds: number[]
}

function AssignmentsEditor({ user, catalog, initialIds }: AssignmentsEditorProps) {
  const { pushToast } = useToast()
  const replaceMutation = useReplaceUserSucursalAssignments()
  const [selectedIds, setSelectedIds] = useState(() => [...initialIds])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const initialSet = useMemo(() => new Set(initialIds), [initialIds])

  const dirty = useMemo(() => {
    if (selectedIds.length !== initialSet.size) return true
    return selectedIds.some((id) => !initialSet.has(id))
  }, [initialSet, selectedIds])

  function toggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  async function handleSave() {
    try {
      await replaceMutation.mutateAsync({
        usuarioId: user.id,
        payload: { sucursalIds: selectedIds },
      })
      pushToast({
        tone: 'success',
        title: 'Asignaciones guardadas',
        description:
          selectedIds.length === 0
            ? `${user.nombre} quedó sin sucursales asignadas.`
            : `Se actualizaron las sucursales de ${user.nombre}.`,
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudieron guardar las asignaciones',
        description: getApiErrorMessage(error),
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Sucursales asignadas</h2>
          <p className="mt-1 text-sm text-muted">
            El empleado solo podrá operar en las sucursales activas que marques acá.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          disabled={!dirty || replaceMutation.isPending}
          onClick={() => void handleSave()}
        >
          <Save className="size-4" aria-hidden />
          {replaceMutation.isPending ? 'Guardando…' : 'Guardar asignaciones'}
        </Button>
      </div>

      {catalog.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">
          No hay sucursales disponibles para asignar.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {catalog.map((sucursal) => {
            const checked = selectedSet.has(sucursal.id)
            return (
              <li key={sucursal.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 px-5 py-3.5 transition-colors',
                    'hover:bg-surface-muted/40',
                    replaceMutation.isPending && 'pointer-events-none opacity-60',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                    checked={checked}
                    disabled={replaceMutation.isPending}
                    onChange={() => toggle(sucursal.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{sucursal.nombre}</span>
                      <span className="font-mono text-xs text-muted">{sucursal.codigo}</span>
                      {!sucursal.activo ? (
                        <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-muted">
                          Inactiva
                        </span>
                      ) : null}
                    </span>
                    {sucursal.direccion?.trim() ? (
                      <span className="mt-0.5 block text-xs text-muted">{sucursal.direccion}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

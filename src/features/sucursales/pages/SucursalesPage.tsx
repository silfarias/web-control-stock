import { useEffect, useMemo, useState } from 'react'
import { Building2, Plus, Search } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { SucursalFormDialog } from '@/features/sucursales/components/SucursalFormDialog'
import { SucursalesTable } from '@/features/sucursales/components/SucursalesTable'
import {
  useActivateSucursal,
  useCreateSucursal,
  useDeleteSucursal,
  useUpdateSucursal,
} from '@/features/sucursales/hooks/use-sucursal-mutations'
import { useSucursales } from '@/features/sucursales/hooks/use-sucursales'
import {
  toCreateSucursalRequest,
  toUpdateSucursalRequest,
  type SucursalFormValues,
} from '@/features/sucursales/schemas/sucursal-schema'
import { CASA_CENTRAL_CODIGO, type Sucursal } from '@/features/sucursales/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'

export function SucursalesPage() {
  const { pushToast } = useToast()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activoFilter, setActivoFilter] = useState<'all' | 'true' | 'false'>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [deactivating, setDeactivating] = useState<Sucursal | null>(null)
  const [deleting, setDeleting] = useState<Sucursal | null>(null)

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
      activo:
        activoFilter === 'all' ? undefined : activoFilter === 'true' ? true : false,
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC' as const,
    }),
    [debouncedSearch, activoFilter, pageNumber],
  )

  const listQuery = useSucursales(params)
  const createMutation = useCreateSucursal()
  const updateMutation = useUpdateSucursal()
  const activateMutation = useActivateSucursal()
  const deleteMutation = useDeleteSucursal()

  const sucursales = listQuery.data?.data ?? []
  const metadata = listQuery.data?.metadata
  const hasFilters = Boolean(debouncedSearch) || activoFilter !== 'all'
  const isEmpty = !listQuery.isLoading && sucursales.length === 0 && !hasFilters
  const isFilteredEmpty = !listQuery.isLoading && sucursales.length === 0 && hasFilters

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(sucursal: Sucursal) {
    setEditing(sucursal)
    setFormOpen(true)
  }

  async function handleSubmit(values: SucursalFormValues) {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        payload: toUpdateSucursalRequest(values),
      })
      pushToast({
        tone: 'success',
        title: 'Sucursal actualizada',
        description: `"${values.nombre.trim()}" se guardó correctamente.`,
      })
      return
    }

    await createMutation.mutateAsync(toCreateSucursalRequest(values))
    pushToast({
      tone: 'success',
      title: 'Sucursal creada',
      description: `"${values.nombre.trim()}" quedó disponible para operar.`,
    })
  }

  async function handleActivate(sucursal: Sucursal) {
    try {
      await activateMutation.mutateAsync(sucursal.id)
      pushToast({
        tone: 'success',
        title: 'Sucursal activada',
        description: `"${sucursal.nombre}" ya puede usarse en el selector operativo.`,
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo activar',
        description: getApiErrorMessage(error),
      })
    }
  }

  async function handleDeactivate() {
    if (!deactivating) return
    try {
      await updateMutation.mutateAsync({
        id: deactivating.id,
        payload: { activo: false },
      })
      pushToast({
        tone: 'success',
        title: 'Sucursal desactivada',
        description: `"${deactivating.nombre}" dejó de estar disponible para operar.`,
      })
      setDeactivating(null)
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo desactivar',
        description: getApiErrorMessage(error),
      })
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (deleting.codigo === CASA_CENTRAL_CODIGO) {
      pushToast({
        tone: 'error',
        title: 'Operación no permitida',
        description: 'Casa Central no se puede eliminar.',
      })
      setDeleting(null)
      return
    }

    try {
      await deleteMutation.mutateAsync(deleting.id)
      pushToast({
        tone: 'success',
        title: 'Sucursal eliminada',
        description: `"${deleting.nombre}" se dio de baja correctamente.`,
      })
      setDeleting(null)
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo eliminar',
        description: getApiErrorMessage(error),
      })
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 max-w-2xl text-sm text-muted">
          Administrá las sucursales del sistema. Casa Central no se puede eliminar; las que
          tienen historial comercial solo se pueden desactivar.
        </p>
        <Button type="button" className="shrink-0" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Nueva sucursal
        </Button>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o código"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar sucursales"
            />
          </div>
          <div className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">Estado</span>
            <Select
              value={activoFilter}
              onValueChange={(value) => {
                setActivoFilter(value as 'all' | 'true' | 'false')
                setPageNumber(1)
              }}
            >
              <SelectTrigger className="w-full lg:w-40" aria-label="Filtrar por estado">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="true">Activas</SelectItem>
                <SelectItem value="false">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {listQuery.isLoading ? <TableSkeleton columns={5} /> : null}

      {listQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">
            No se pudieron cargar las sucursales
          </p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(listQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void listQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="Todavía no hay sucursales"
            description="Creá la primera para operar en múltiples locales."
            action={
              <Button type="button" onClick={openCreate}>
                <Plus className="size-4" aria-hidden />
                Nueva sucursal
              </Button>
            }
          />
        </Card>
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos sucursales que coincidan con los filtros aplicados."
          />
        </Card>
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && sucursales.length > 0 ? (
        <div className="flex flex-col gap-4">
          <SucursalesTable
            sucursales={sucursales}
            onEdit={openEdit}
            onActivate={(item) => void handleActivate(item)}
            onDeactivate={setDeactivating}
            onDelete={setDeleting}
          />

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'sucursal', plural: 'sucursales' }}
              disabled={listQuery.isFetching}
              onPageChange={setPageNumber}
            />
          ) : null}
        </div>
      ) : null}

      <SucursalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        sucursal={editing}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deactivating)}
        onOpenChange={(open) => {
          if (!open) setDeactivating(null)
        }}
        title="Desactivar sucursal"
        description={
          deactivating
            ? `“${deactivating.nombre}” dejará de aparecer en el selector operativo. Podés reactivarla después.`
            : ''
        }
        confirmLabel="Desactivar"
        tone="danger"
        loading={updateMutation.isPending}
        onConfirm={() => void handleDeactivate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Eliminar sucursal"
        description={
          deleting
            ? `Se dará de baja “${deleting.nombre}”. Si tiene ventas, compras, cajas o movimientos, la API rechazará la eliminación (en ese caso desactivá la sucursal).`
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

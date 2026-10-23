import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Truck } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { SupplierFormDialog } from '@/features/suppliers/components/SupplierFormDialog'
import { SuppliersTable } from '@/features/suppliers/components/SuppliersTable'
import {
  useCreateSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
} from '@/features/suppliers/hooks/use-supplier-mutations'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import {
  toCreateProveedorRequest,
  toUpdateProveedorRequest,
  type SupplierFormValues,
} from '@/features/suppliers/schemas/supplier-schema'
import type { Proveedor } from '@/features/suppliers/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

export function SuppliersPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'
  const { pushToast } = useToast()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activoFilter, setActivoFilter] = useState<'all' | 'true' | 'false'>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Proveedor | null>(null)

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

  const suppliersQuery = useSuppliers(params)
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const deleteMutation = useDeleteSupplier()

  const suppliers = suppliersQuery.data?.data ?? []
  const metadata = suppliersQuery.data?.metadata
  const hasFilters = Boolean(debouncedSearch) || activoFilter !== 'all'
  const isEmpty = !suppliersQuery.isLoading && suppliers.length === 0 && !hasFilters
  const isFilteredEmpty =
    !suppliersQuery.isLoading && suppliers.length === 0 && hasFilters

  function openCreate() {
    setEditingSupplier(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Proveedor) {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }

  async function handleSubmit(values: SupplierFormValues) {
    if (editingSupplier) {
      await updateMutation.mutateAsync({
        id: editingSupplier.id,
        payload: toUpdateProveedorRequest(values),
      })
      pushToast({
        tone: 'success',
        title: 'Proveedor actualizado',
        description: `"${values.nombre.trim()}" se guardó correctamente.`,
      })
      return
    }

    await createMutation.mutateAsync(toCreateProveedorRequest(values))
    pushToast({
      tone: 'success',
      title: 'Proveedor creado',
      description: `"${values.nombre.trim()}" se agregó al catálogo.`,
    })
  }

  async function handleDelete() {
    if (!deletingSupplier) return
    try {
      await deleteMutation.mutateAsync(deletingSupplier.id)
      pushToast({
        tone: 'success',
        title: 'Proveedor eliminado',
        description: `"${deletingSupplier.nombre}" se dio de baja correctamente.`,
      })
      setDeletingSupplier(null)
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
          Administrá el registro de proveedores para las próximas operaciones de compra.
        </p>
        {canManage ? (
          <Button type="button" className="shrink-0" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Nuevo proveedor
          </Button>
        ) : null}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre, CUIT, email o teléfono"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar proveedores"
            />
          </div>
          <label className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">Estado</span>
            <select
              value={activoFilter}
              onChange={(event) => {
                setActivoFilter(event.target.value as 'all' | 'true' | 'false')
                setPageNumber(1)
              }}
              className={cn(
                'h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors lg:w-40',
                'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
              )}
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
        </div>
      </Card>

      {suppliersQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando proveedores…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {suppliersQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">
            No se pudieron cargar los proveedores
          </p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(suppliersQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void suppliersQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!suppliersQuery.isLoading && !suppliersQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={Truck}
            title="Todavía no hay proveedores"
            description={
              canManage
                ? 'Creá el primero para empezar a registrar compras más adelante.'
                : 'Cuando un administrador cargue proveedores, van a aparecer acá.'
            }
            action={
              canManage ? (
                <Button type="button" onClick={openCreate}>
                  <Plus className="size-4" aria-hidden />
                  Nuevo proveedor
                </Button>
              ) : null
            }
          />
        </Card>
      ) : null}

      {!suppliersQuery.isLoading && !suppliersQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos proveedores que coincidan con los filtros aplicados."
          />
        </Card>
      ) : null}

      {!suppliersQuery.isLoading && !suppliersQuery.isError && suppliers.length > 0 ? (
        <div className="flex flex-col gap-4">
          <SuppliersTable
            suppliers={suppliers}
            canManage={canManage}
            onEdit={openEdit}
            onDelete={setDeletingSupplier}
          />

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'proveedor', plural: 'proveedores' }}
              disabled={suppliersQuery.isFetching}
              onPageChange={setPageNumber}
            />
          ) : null}
        </div>
      ) : null}

      {canManage ? (
        <SupplierFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          supplier={editingSupplier}
          submitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingSupplier)}
        onOpenChange={(open) => {
          if (!open) setDeletingSupplier(null)
        }}
        title="Eliminar proveedor"
        description={
          deletingSupplier
            ? `Se va a dar de baja “${deletingSupplier.nombre}”. Dejará de aparecer en los listados. Si tiene compras asociadas, la operación puede no completarse.`
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

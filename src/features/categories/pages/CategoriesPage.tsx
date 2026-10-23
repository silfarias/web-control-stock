import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Tags } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { CategoriesTable } from '@/features/categories/components/CategoriesTable'
import { CategoryFormDialog } from '@/features/categories/components/CategoryFormDialog'
import { useCategories } from '@/features/categories/hooks/use-categories'
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/hooks/use-category-mutations'
import type { Categoria } from '@/features/categories/types'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'

export function CategoriesPage() {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const canManage = user?.role === 'ADMIN'

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Categoria | null>(null)

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
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC' as const,
    }),
    [debouncedSearch, pageNumber],
  )

  const categoriesQuery = useCategories(params)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const categories = categoriesQuery.data?.data ?? []
  const metadata = categoriesQuery.data?.metadata
  const isEmpty = !categoriesQuery.isLoading && categories.length === 0 && !debouncedSearch
  const isFilteredEmpty =
    !categoriesQuery.isLoading && categories.length === 0 && Boolean(debouncedSearch)

  function openCreate() {
    setEditingCategory(null)
    setFormOpen(true)
  }

  function openEdit(category: Categoria) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  async function handleSubmit(values: { nombre: string; descripcion?: string }) {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        payload: {
          nombre: values.nombre,
          descripcion: values.descripcion ?? '',
        },
      })
      pushToast({
        tone: 'success',
        title: 'Categoría actualizada',
        description: `"${values.nombre}" se guardó correctamente.`,
      })
      return
    }

    await createMutation.mutateAsync({
      nombre: values.nombre,
      ...(values.descripcion ? { descripcion: values.descripcion } : {}),
    })
    pushToast({
      tone: 'success',
      title: 'Categoría creada',
      description: `"${values.nombre}" se agregó al catálogo.`,
    })
  }

  async function handleDelete() {
    if (!deletingCategory) return
    try {
      await deleteMutation.mutateAsync(deletingCategory.id)
      pushToast({
        tone: 'success',
        title: 'Categoría eliminada',
        description: `"${deletingCategory.nombre}" se eliminó correctamente.`,
      })
      setDeletingCategory(null)
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
          Organizá el catálogo en grupos claros para facilitar la búsqueda y la operación diaria.
        </p>
        {canManage ? (
          <Button type="button" className="shrink-0" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Nueva categoría
          </Button>
        ) : null}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="max-w-md">
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por nombre o descripción"
            leadingIcon={<Search className="size-4" aria-hidden />}
            aria-label="Buscar categorías"
          />
        </div>
      </Card>

      {categoriesQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando categorías…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {categoriesQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudieron cargar las categorías</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(categoriesQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void categoriesQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!categoriesQuery.isLoading && !categoriesQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={Tags}
            title="Todavía no hay categorías"
            description={
              canManage
                ? 'Creá la primera categoría para empezar a organizar el catálogo.'
                : 'Cuando un administrador cargue categorías, van a aparecer acá.'
            }
            action={
              canManage ? (
                <Button type="button" onClick={openCreate}>
                  <Plus className="size-4" aria-hidden />
                  Nueva categoría
                </Button>
              ) : null
            }
          />
        </Card>
      ) : null}

      {!categoriesQuery.isLoading && !categoriesQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description={`No encontramos categorías que coincidan con “${debouncedSearch}”.`}
          />
        </Card>
      ) : null}

      {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length > 0 ? (
        <div className="flex flex-col gap-4">
          <CategoriesTable
            categories={categories}
            canManage={canManage}
            onEdit={openEdit}
            onDelete={setDeletingCategory}
          />

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'categoría', plural: 'categorías' }}
              disabled={categoriesQuery.isFetching}
              onPageChange={setPageNumber}
            />
          ) : null}
        </div>
      ) : null}

      {canManage ? (
        <CategoryFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          category={editingCategory}
          submitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null)
        }}
        title="Eliminar categoría"
        description={
          deletingCategory
            ? `Se va a eliminar “${deletingCategory.nombre}”. Dejará de aparecer en los listados. Si está en uso, la operación puede no completarse.`
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

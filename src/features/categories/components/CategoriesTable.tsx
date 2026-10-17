import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Categoria } from '@/features/categories/types'
import { formatShortDate } from '@/lib/utils/format'

type CategoriesTableProps = {
  categories: Categoria[]
  canManage: boolean
  onEdit: (category: Categoria) => void
  onDelete: (category: Categoria) => void
}

export function CategoriesTable({
  categories,
  canManage,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listado de categorías</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Descripción
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Creada
              </th>
              {canManage ? (
                <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 font-medium sm:px-5">{category.nombre}</td>
                <td className="max-w-xs px-4 py-3.5 text-muted sm:px-5">
                  <span className="line-clamp-2">
                    {category.descripcion?.trim() ? category.descripcion : '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums sm:px-5">
                  {formatShortDate(category.createdAt)}
                </td>
                {canManage ? (
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => onEdit(category)}
                        aria-label={`Editar ${category.nombre}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-error-ink hover:bg-error-soft hover:text-error-ink"
                        onClick={() => onDelete(category)}
                        aria-label={`Eliminar ${category.nombre}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

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
      <Table className="min-w-[36rem]">
        <TableCaption className="sr-only">Listado de categorías</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Creada</TableHead>
            {canManage ? <TableHead className="text-right">Acciones</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.nombre}</TableCell>
              <TableCell className="max-w-xs text-muted">
                <span className="line-clamp-2">
                  {category.descripcion?.trim() ? category.descripcion : '—'}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted tabular-nums">
                {formatShortDate(category.createdAt)}
              </TableCell>
              {canManage ? (
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

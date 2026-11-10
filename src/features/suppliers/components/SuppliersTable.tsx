import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
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
import type { Proveedor } from '@/features/suppliers/types'

type SuppliersTableProps = {
  suppliers: Proveedor[]
  canManage: boolean
  onEdit: (supplier: Proveedor) => void
  onDelete: (supplier: Proveedor) => void
}

export function SuppliersTable({
  suppliers,
  canManage,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[48rem]">
        <TableCaption className="sr-only">Listado de proveedores</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nombre</TableHead>
            <TableHead>CUIT</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            {canManage ? <TableHead className="text-right">Acciones</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>
                <p className="font-medium">{supplier.nombre}</p>
                {supplier.direccion?.trim() ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{supplier.direccion}</p>
                ) : null}
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs text-muted">
                {supplier.cuit?.trim() ? supplier.cuit : '—'}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5 text-sm text-muted">
                  <span>{supplier.telefono?.trim() ? supplier.telefono : '—'}</span>
                  <span className="line-clamp-1">
                    {supplier.email?.trim() ? supplier.email : '—'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {supplier.activo ? (
                  <Badge tone="success">Activo</Badge>
                ) : (
                  <Badge tone="neutral">Inactivo</Badge>
                )}
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
                          onClick={() => onEdit(supplier)}
                          aria-label={`Editar ${supplier.nombre}`}
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
                          onClick={() => onDelete(supplier)}
                          aria-label={`Eliminar ${supplier.nombre}`}
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

import { Building2, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
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
import { CASA_CENTRAL_CODIGO, type Sucursal } from '@/features/sucursales/types'

type SucursalesTableProps = {
  sucursales: Sucursal[]
  onEdit: (sucursal: Sucursal) => void
  onActivate: (sucursal: Sucursal) => void
  onDeactivate: (sucursal: Sucursal) => void
  onDelete: (sucursal: Sucursal) => void
}

export function SucursalesTable({
  sucursales,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: SucursalesTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[48rem]">
        <TableCaption className="sr-only">Listado de sucursales</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Sucursal</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sucursales.map((sucursal) => {
            const isCasaCentral = sucursal.codigo === CASA_CENTRAL_CODIGO
            return (
              <TableRow key={sucursal.id}>
                <TableCell>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-primary">
                      <Building2 className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{sucursal.nombre}</p>
                      {sucursal.direccion?.trim() ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                          {sucursal.direccion}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted">
                  {sucursal.codigo}
                </TableCell>
                <TableCell className="text-sm text-muted">
                  {sucursal.telefono?.trim() ? sucursal.telefono : '—'}
                </TableCell>
                <TableCell>
                  {sucursal.activo ? (
                    <Badge tone="success">Activa</Badge>
                  ) : (
                    <Badge tone="neutral">Inactiva</Badge>
                  )}
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
                          onClick={() => onEdit(sucursal)}
                          aria-label={`Editar ${sucursal.nombre}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>

                    {sucursal.activo ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            onClick={() => onDeactivate(sucursal)}
                            aria-label={`Desactivar ${sucursal.nombre}`}
                          >
                            <PowerOff className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Desactivar</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            onClick={() => onActivate(sucursal)}
                            aria-label={`Activar ${sucursal.nombre}`}
                          >
                            <Power className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Activar</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 text-error-ink hover:bg-error-soft hover:text-error-ink disabled:opacity-40"
                          onClick={() => onDelete(sucursal)}
                          disabled={isCasaCentral}
                          aria-label={
                            isCasaCentral
                              ? 'Casa Central no se puede eliminar'
                              : `Eliminar ${sucursal.nombre}`
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isCasaCentral ? 'Casa Central no se elimina' : 'Eliminar'}
                      </TooltipContent>
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

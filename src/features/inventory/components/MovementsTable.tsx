import { Badge } from '@/components/ui/Badge'
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
import type { MovimientoStock } from '@/features/inventory/types'
import {
  movementDirection,
  movementReferenceLabel,
  movementTypeLabel,
} from '@/features/inventory/utils/movement-labels'
import { cn } from '@/lib/utils/cn'
import { formatDateTime } from '@/lib/utils/format'

type MovementsTableProps = {
  movements: MovimientoStock[]
  /** Oculta la columna de producto (útil en detalle de un producto). */
  hideProduct?: boolean
}

export function MovementsTable({ movements, hideProduct = false }: MovementsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className={hideProduct ? 'min-w-[44rem]' : 'min-w-[56rem]'}>
        <TableCaption className="sr-only">Historial de movimientos de stock</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Fecha</TableHead>
            {!hideProduct ? <TableHead>Producto</TableHead> : null}
            <TableHead>Tipo</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Usuario</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const direction = movementDirection(movement.tipo)
            const isIn = direction === 'in'

            return (
              <TableRow key={movement.id}>
                <TableCell className="whitespace-nowrap text-muted tabular-nums">
                  {formatDateTime(movement.createdAt)}
                </TableCell>
                {!hideProduct ? (
                  <TableCell>
                    {movement.producto ? (
                      <>
                        <p className="font-medium">{movement.producto.nombre}</p>
                        <p className="font-mono text-xs text-muted">{movement.producto.codigo}</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted">Producto eliminado</p>
                    )}
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge tone={isIn ? 'success' : 'warning'}>
                      {movementTypeLabel(movement.tipo)}
                    </Badge>
                    <span className="text-xs text-muted">
                      {movementReferenceLabel(movement.tipoReferencia)}
                      {movement.referenciaId != null ? ` #${movement.referenciaId}` : ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'tabular-nums font-medium',
                    isIn ? 'text-success-ink' : 'text-warning-ink',
                  )}
                >
                  {isIn ? '+' : '−'}
                  {movement.cantidad}
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums text-muted">
                  {movement.stockAnterior} → {movement.stockNuevo}
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="line-clamp-2 text-sm">{movement.motivo}</p>
                  {movement.descripcion?.trim() ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{movement.descripcion}</p>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted">{movement.usuario?.nombre ?? '—'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

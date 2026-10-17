import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
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
      <div className="overflow-x-auto">
        <table
          className={cn(
            'w-full border-collapse text-left text-sm',
            hideProduct ? 'min-w-[44rem]' : 'min-w-[56rem]',
          )}
        >
          <caption className="sr-only">Historial de movimientos de stock</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Fecha
              </th>
              {!hideProduct ? (
                <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                  Producto
                </th>
              ) : null}
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Cantidad
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Motivo
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Usuario
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => {
              const direction = movementDirection(movement.tipo)
              const isIn = direction === 'in'

              return (
                <tr key={movement.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums sm:px-5">
                    {formatDateTime(movement.createdAt)}
                  </td>
                  {!hideProduct ? (
                    <td className="px-4 py-3.5 sm:px-5">
                      {movement.producto ? (
                        <>
                          <p className="font-medium">{movement.producto.nombre}</p>
                          <p className="font-mono text-xs text-muted">
                            {movement.producto.codigo}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted">Producto eliminado</p>
                      )}
                    </td>
                  ) : null}
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex flex-col items-start gap-1">
                      <Badge tone={isIn ? 'success' : 'warning'}>
                        {movementTypeLabel(movement.tipo)}
                      </Badge>
                      <span className="text-xs text-muted">
                        {movementReferenceLabel(movement.tipoReferencia)}
                        {movement.referenciaId != null ? ` #${movement.referenciaId}` : ''}
                      </span>
                    </div>
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3.5 tabular-nums font-medium sm:px-5',
                      isIn ? 'text-success-ink' : 'text-warning-ink',
                    )}
                  >
                    {isIn ? '+' : '−'}
                    {movement.cantidad}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-muted sm:px-5">
                    {movement.stockAnterior} → {movement.stockNuevo}
                  </td>
                  <td className="max-w-xs px-4 py-3.5 sm:px-5">
                    <p className="line-clamp-2 text-sm">{movement.motivo}</p>
                    {movement.descripcion?.trim() ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        {movement.descripcion}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-muted sm:px-5">
                    {movement.usuario?.nombre ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

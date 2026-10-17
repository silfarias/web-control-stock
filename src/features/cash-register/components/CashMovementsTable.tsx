import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { MovimientoCaja } from '@/features/cash-register/types'
import {
  cashMovementTypeLabel,
  cashMovementTypeTone,
} from '@/features/cash-register/utils/cash-status'
import { formatDateTime, formatMoney } from '@/lib/utils/format'

type CashMovementsTableProps = {
  movements: MovimientoCaja[]
}

export function CashMovementsTable({ movements }: CashMovementsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Movimientos de caja</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Descripción
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Usuario
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums sm:px-5">
                  {formatDateTime(movement.createdAt)}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <Badge tone={cashMovementTypeTone(movement.tipo)}>
                    {cashMovementTypeLabel(movement.tipo)}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <p className="font-medium">{movement.descripcion?.trim() || '—'}</p>
                  {movement.referenciaId != null ? (
                    <p className="mt-0.5 text-xs text-muted">Ref. #{movement.referenciaId}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-muted sm:px-5">
                  {movement.usuario?.nombre ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums font-medium sm:px-5">
                  {formatMoney(movement.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

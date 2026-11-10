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
      <Table className="min-w-[40rem]">
        <TableCaption className="sr-only">Movimientos de caja</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="whitespace-nowrap text-muted tabular-nums">
                {formatDateTime(movement.createdAt)}
              </TableCell>
              <TableCell>
                <Badge tone={cashMovementTypeTone(movement.tipo)}>
                  {cashMovementTypeLabel(movement.tipo)}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="font-medium">{movement.descripcion?.trim() || '—'}</p>
                {movement.referenciaId != null ? (
                  <p className="mt-0.5 text-xs text-muted">Ref. #{movement.referenciaId}</p>
                ) : null}
              </TableCell>
              <TableCell className="text-muted">{movement.usuario?.nombre ?? '—'}</TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums font-medium">
                {formatMoney(movement.monto)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

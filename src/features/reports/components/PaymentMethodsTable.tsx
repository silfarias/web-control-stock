import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import type { ReporteVentasPorMetodoPago } from '@/features/reports/types'
import { paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { formatMoney } from '@/lib/utils/format'

type PaymentMethodsTableProps = {
  items: ReporteVentasPorMetodoPago[]
}

export function PaymentMethodsTable({ items }: PaymentMethodsTableProps) {
  return (
    <Table className="min-w-[36rem]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Método de pago</TableHead>
          <TableHead className="text-right">Ventas</TableHead>
          <TableHead className="text-right">Unidades</TableHead>
          <TableHead className="text-right">Ingresos</TableHead>
          <TableHead className="text-right">% ingresos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.metodoPago}>
            <TableCell className="font-medium">{paymentMethodLabel(item.metodoPago)}</TableCell>
            <TableCell className="text-right tabular-nums">{item.cantidadVentas}</TableCell>
            <TableCell className="text-right tabular-nums">{item.unidadesVendidas}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(item.totalIngresos)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted">
              {formatPercent(item.porcentajeIngresos)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '—'
  return `${value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} %`
}

import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import type { ReporteInventarioItem } from '@/features/reports/types'
import { formatMoney } from '@/lib/utils/format'

type InventoryReportTableProps = {
  items: ReporteInventarioItem[]
}

export function InventoryReportTable({ items }: InventoryReportTableProps) {
  return (
    <Table className="min-w-[48rem]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Producto</TableHead>
          <TableHead>Código</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Costo unit.</TableHead>
          <TableHead className="text-right">Venta unit.</TableHead>
          <TableHead className="text-right">Valor costo</TableHead>
          <TableHead className="text-right">Valor venta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.productoId}>
            <TableCell>
              <Link
                to={`/inventario/${item.productoId}`}
                className="font-medium text-primary hover:underline"
              >
                {item.nombre}
              </Link>
            </TableCell>
            <TableCell className="tabular-nums text-muted">{item.codigo}</TableCell>
            <TableCell className="text-right tabular-nums">{item.cantidad}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(item.precioCosto)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoney(item.precioVenta)}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(item.valorCosto)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(item.valorVenta)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

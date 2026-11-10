import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import type { ReporteProductoTopItem } from '@/features/reports/types'
import { formatMoney } from '@/lib/utils/format'

type TopProductsTableProps = {
  items: ReporteProductoTopItem[]
}

export function TopProductsTable({ items }: TopProductsTableProps) {
  return (
    <Table className="min-w-[36rem]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>#</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Código</TableHead>
          <TableHead className="text-right">Unidades</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.productoId}>
            <TableCell className="tabular-nums text-muted">{index + 1}</TableCell>
            <TableCell>
              <Link
                to={`/productos/${item.productoId}`}
                className="font-medium text-primary hover:underline"
              >
                {item.nombre}
              </Link>
            </TableCell>
            <TableCell className="tabular-nums text-muted">{item.codigo}</TableCell>
            <TableCell className="text-right tabular-nums">{item.cantidadVendida}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(item.totalVendido)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

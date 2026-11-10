import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import type { ReporteStockBajoItem } from '@/features/reports/types'

type LowStockTableProps = {
  items: ReporteStockBajoItem[]
}

export function LowStockTable({ items }: LowStockTableProps) {
  return (
    <Table className="min-w-[40rem]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Producto</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Mínimo</TableHead>
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
            <TableCell>{item.categoriaNombre || '—'}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-error-ink">
              {item.cantidad}
            </TableCell>
            <TableCell className="text-right tabular-nums">{item.minimoStock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

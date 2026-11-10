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
import type { ItemVenta } from '@/features/sales/types'
import { formatMoney } from '@/lib/utils/format'

type SaleItemsTableProps = {
  items: ItemVenta[]
}

export function SaleItemsTable({ items }: SaleItemsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[40rem]">
        <TableCaption className="sr-only">Ítems de la venta</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio unitario</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.producto ? (
                  <>
                    <p className="font-medium">{item.producto.nombre}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">{item.producto.codigo}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted">Producto eliminado</p>
                )}
              </TableCell>
              <TableCell className="tabular-nums">{item.cantidad}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">
                {formatMoney(item.precioUnitario)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums font-medium">
                {formatMoney(item.subtotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

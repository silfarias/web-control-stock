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
import type { ItemCompra } from '@/features/purchases/types'
import { formatMoney } from '@/lib/utils/format'

type PurchaseItemsTableProps = {
  items: ItemCompra[]
}

export function PurchaseItemsTable({ items }: PurchaseItemsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[40rem]">
        <TableCaption className="sr-only">Ítems de la compra</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Costo unitario</TableHead>
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
                {formatMoney(item.costoUnitario)}
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

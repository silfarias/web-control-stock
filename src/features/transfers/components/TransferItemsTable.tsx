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
import type { ItemTransferencia } from '@/features/transfers/types'

type TransferItemsTableProps = {
  items: ItemTransferencia[]
}

export function TransferItemsTable({ items }: TransferItemsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[32rem]">
        <TableCaption className="sr-only">Ítems de la transferencia</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
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
              <TableCell className="text-right tabular-nums font-medium">
                {item.cantidad}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

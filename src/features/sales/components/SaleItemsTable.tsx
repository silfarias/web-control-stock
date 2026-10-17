import { Card } from '@/components/ui/Card'
import type { ItemVenta } from '@/features/sales/types'
import { formatMoney } from '@/lib/utils/format'

type SaleItemsTableProps = {
  items: ItemVenta[]
}

export function SaleItemsTable({ items }: SaleItemsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Ítems de la venta</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Producto
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Cantidad
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Precio unitario
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 sm:px-5">
                  {item.producto ? (
                    <>
                      <p className="font-medium">{item.producto.nombre}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        {item.producto.codigo}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted">Producto eliminado</p>
                  )}
                </td>
                <td className="px-4 py-3.5 tabular-nums sm:px-5">{item.cantidad}</td>
                <td className="px-4 py-3.5 whitespace-nowrap tabular-nums sm:px-5">
                  {formatMoney(item.precioUnitario)}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums font-medium sm:px-5">
                  {formatMoney(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

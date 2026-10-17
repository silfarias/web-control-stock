import { Card } from '@/components/ui/Card'
import type { ItemCompra } from '@/features/purchases/types'
import { formatMoney } from '@/lib/utils/format'

type PurchaseItemsTableProps = {
  items: ItemCompra[]
}

export function PurchaseItemsTable({ items }: PurchaseItemsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Ítems de la compra</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Producto
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Cantidad
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Costo unitario
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
                  <p className="font-medium">{item.producto?.nombre ?? '—'}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {item.producto?.codigo ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-3.5 tabular-nums sm:px-5">{item.cantidad}</td>
                <td className="px-4 py-3.5 whitespace-nowrap tabular-nums sm:px-5">
                  {formatMoney(item.costoUnitario)}
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

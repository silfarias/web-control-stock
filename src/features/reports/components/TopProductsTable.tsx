import { Link } from 'react-router'
import type { ReporteProductoTopItem } from '@/features/reports/types'
import { formatMoney } from '@/lib/utils/format'

type TopProductsTableProps = {
  items: ReporteProductoTopItem[]
}

export function TopProductsTable({ items }: TopProductsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium sm:px-5">#</th>
            <th className="px-4 py-3 font-medium sm:px-5">Producto</th>
            <th className="px-4 py-3 font-medium sm:px-5">Código</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Unidades</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.productoId} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-3.5 tabular-nums text-muted sm:px-5">{index + 1}</td>
              <td className="px-4 py-3.5 sm:px-5">
                <Link
                  to={`/productos/${item.productoId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {item.nombre}
                </Link>
              </td>
              <td className="px-4 py-3.5 tabular-nums text-muted sm:px-5">{item.codigo}</td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">
                {item.cantidadVendida}
              </td>
              <td className="px-4 py-3.5 text-right font-medium tabular-nums sm:px-5">
                {formatMoney(item.totalVendido)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

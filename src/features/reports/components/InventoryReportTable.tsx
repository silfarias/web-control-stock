import { Link } from 'react-router'
import type { ReporteInventarioItem } from '@/features/reports/types'
import { formatMoney } from '@/lib/utils/format'

type InventoryReportTableProps = {
  items: ReporteInventarioItem[]
}

export function InventoryReportTable({ items }: InventoryReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium sm:px-5">Producto</th>
            <th className="px-4 py-3 font-medium sm:px-5">Código</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Cantidad</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Costo unit.</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Venta unit.</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Valor costo</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Valor venta</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productoId} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-3.5 sm:px-5">
                <Link
                  to={`/inventario/${item.productoId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {item.nombre}
                </Link>
              </td>
              <td className="px-4 py-3.5 tabular-nums text-muted sm:px-5">{item.codigo}</td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">{item.cantidad}</td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">
                {formatMoney(item.precioCosto)}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">
                {formatMoney(item.precioVenta)}
              </td>
              <td className="px-4 py-3.5 text-right font-medium tabular-nums sm:px-5">
                {formatMoney(item.valorCosto)}
              </td>
              <td className="px-4 py-3.5 text-right font-medium tabular-nums sm:px-5">
                {formatMoney(item.valorVenta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

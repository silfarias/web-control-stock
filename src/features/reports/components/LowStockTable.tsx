import { Link } from 'react-router'
import type { ReporteStockBajoItem } from '@/features/reports/types'

type LowStockTableProps = {
  items: ReporteStockBajoItem[]
}

export function LowStockTable({ items }: LowStockTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium sm:px-5">Producto</th>
            <th className="px-4 py-3 font-medium sm:px-5">Código</th>
            <th className="px-4 py-3 font-medium sm:px-5">Categoría</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Stock</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Mínimo</th>
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
              <td className="px-4 py-3.5 sm:px-5">{item.categoriaNombre || '—'}</td>
              <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-error-ink sm:px-5">
                {item.cantidad}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">{item.minimoStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

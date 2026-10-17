import type { ReporteVentasPorMetodoPago } from '@/features/reports/types'
import { paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { formatMoney } from '@/lib/utils/format'

type PaymentMethodsTableProps = {
  items: ReporteVentasPorMetodoPago[]
}

export function PaymentMethodsTable({ items }: PaymentMethodsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium sm:px-5">Método de pago</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Ventas</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Unidades</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">Ingresos</th>
            <th className="px-4 py-3 text-right font-medium sm:px-5">% ingresos</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.metodoPago} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-3.5 font-medium sm:px-5">
                {paymentMethodLabel(item.metodoPago)}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">
                {item.cantidadVentas}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums sm:px-5">
                {item.unidadesVendidas}
              </td>
              <td className="px-4 py-3.5 text-right font-medium tabular-nums sm:px-5">
                {formatMoney(item.totalIngresos)}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums text-muted sm:px-5">
                {formatPercent(item.porcentajeIngresos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '—'
  return `${value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} %`
}

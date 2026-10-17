import { Link } from 'react-router'
import { Eye } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { CashStatusBadge } from '@/features/cash-register/components/CashStatusBadge'
import type { Caja } from '@/features/cash-register/types'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatMoney } from '@/lib/utils/format'

type CashHistoryTableProps = {
  cajas: Caja[]
}

export function CashHistoryTable({ cajas }: CashHistoryTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <caption className="sr-only">Historial de cajas</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Caja
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Responsable
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Apertura
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Montos
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {cajas.map((caja) => (
              <tr key={caja.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 sm:px-5">
                  <p className="font-medium tabular-nums">#{caja.id}</p>
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <p className="font-medium">{caja.usuario?.nombre ?? '—'}</p>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums sm:px-5">
                  {formatDateTime(caja.abiertaEn)}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <CashStatusBadge estado={caja.estado} />
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <p className="tabular-nums">
                    Apertura {formatMoney(caja.montoApertura)}
                  </p>
                  {caja.estado === 'CERRADA' && caja.montoCierre != null ? (
                    <p className="mt-0.5 text-xs text-muted tabular-nums">
                      Cierre {formatMoney(caja.montoCierre)}
                      {caja.montoEsperado != null
                        ? ` · Esperado ${formatMoney(caja.montoEsperado)}`
                        : ''}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <div className="flex justify-end">
                    <Link
                      to={`/caja/${caja.id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9')}
                      aria-label={`Ver detalle de caja #${caja.id}`}
                    >
                      <Eye className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

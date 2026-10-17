import { Link } from 'react-router'
import { Eye, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { PurchaseStatusBadge } from '@/features/purchases/components/PurchaseStatusBadge'
import type { Compra } from '@/features/purchases/types'
import { getPurchaseDraftActions } from '@/features/purchases/utils/purchase-actions'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatMoney } from '@/lib/utils/format'

type PurchasesTableProps = {
  purchases: Compra[]
  canManage?: boolean
}

export function PurchasesTable({ purchases, canManage = false }: PurchasesTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listado de compras</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Compra
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Proveedor
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Total
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => {
              const { canEdit } = getPurchaseDraftActions(purchase.estado, canManage)
              return (
                <tr key={purchase.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3.5 sm:px-5">
                    <p className="font-medium tabular-nums">#{purchase.id}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {purchase.items?.length ?? 0}{' '}
                      {(purchase.items?.length ?? 0) === 1 ? 'ítem' : 'ítems'}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <p className="font-medium">{purchase.proveedor?.nombre ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums sm:px-5">
                    {formatDateTime(purchase.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <PurchaseStatusBadge estado={purchase.estado} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap tabular-nums font-medium sm:px-5">
                    {formatMoney(purchase.total)}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/compras/${purchase.id}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'size-9',
                        )}
                        aria-label={`Ver detalle de compra #${purchase.id}`}
                      >
                        <Eye className="size-4" />
                      </Link>
                      {canEdit ? (
                        <Link
                          to={`/compras/${purchase.id}/editar`}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-9',
                          )}
                          aria-label={`Editar borrador de compra #${purchase.id}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

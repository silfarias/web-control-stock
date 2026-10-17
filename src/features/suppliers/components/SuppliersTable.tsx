import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Proveedor } from '@/features/suppliers/types'

type SuppliersTableProps = {
  suppliers: Proveedor[]
  canManage: boolean
  onEdit: (supplier: Proveedor) => void
  onDelete: (supplier: Proveedor) => void
}

export function SuppliersTable({
  suppliers,
  canManage,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listado de proveedores</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                CUIT
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Contacto
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Estado
              </th>
              {canManage ? (
                <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 sm:px-5">
                  <p className="font-medium">{supplier.nombre}</p>
                  {supplier.direccion?.trim() ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{supplier.direccion}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-muted sm:px-5">
                  {supplier.cuit?.trim() ? supplier.cuit : '—'}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <div className="flex flex-col gap-0.5 text-sm text-muted">
                    <span>{supplier.telefono?.trim() ? supplier.telefono : '—'}</span>
                    <span className="line-clamp-1">
                      {supplier.email?.trim() ? supplier.email : '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  {supplier.activo ? (
                    <Badge tone="success">Activo</Badge>
                  ) : (
                    <Badge tone="neutral">Inactivo</Badge>
                  )}
                </td>
                {canManage ? (
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => onEdit(supplier)}
                        aria-label={`Editar ${supplier.nombre}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-error-ink hover:bg-error-soft hover:text-error-ink"
                        onClick={() => onDelete(supplier)}
                        aria-label={`Eliminar ${supplier.nombre}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

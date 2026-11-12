import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'

/**
 * Bloquea el contenido operativo hasta tener una sucursal válida seleccionada.
 */
export function RequireSucursal({ children }: { children: ReactNode }) {
  const { isReady, isLoading, status, error, refetch } = useSucursal()

  if (isReady) return children

  if (isLoading) {
    return (
      <Card className="mx-auto mt-10 max-w-md px-6 py-12 text-center">
        <Building2 className="mx-auto size-8 text-primary" aria-hidden />
        <p className="mt-4 text-sm font-medium">Preparando sucursal operativa…</p>
        <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
      </Card>
    )
  }

  if (status === 'empty') {
    return (
      <Card className="mx-auto mt-10 max-w-md px-6 py-12 text-center">
        <Building2 className="mx-auto size-8 text-warning" aria-hidden />
        <p className="mt-4 text-sm font-semibold">No tenés sucursales asignadas</p>
        <p className="mt-1 text-sm text-muted">
          Pedile a un administrador que te asigne al menos una sucursal activa.
        </p>
      </Card>
    )
  }

  return (
    <Card className="mx-auto mt-10 max-w-md border-error/20 bg-error-soft px-6 py-12 text-center">
      <Building2 className="mx-auto size-8 text-error-ink" aria-hidden />
      <p className="mt-4 text-sm font-semibold text-error-ink">No se pudieron cargar las sucursales</p>
      <p className="mt-1 text-sm text-error-ink/90">{error ?? 'Intentá de nuevo.'}</p>
      <Button type="button" className="mt-5" onClick={() => void refetch()}>
        Reintentar
      </Button>
    </Card>
  )
}

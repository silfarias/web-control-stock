import type { ReactNode } from 'react'
import { AlertCircle, ChartColumn } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getApiErrorMessage } from '@/lib/api/errors'

type ReportQueryStateProps = {
  isLoading: boolean
  isError: boolean
  error: unknown
  isEmpty: boolean
  emptyTitle: string
  emptyDescription?: string
  onRetry?: () => void
  children: ReactNode
}

export function ReportQueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: ReportQueryStateProps) {
  if (isLoading) {
    return (
      <Card className="px-6 py-16 text-center">
        <p className="text-sm font-medium">Cargando reporte…</p>
        <p className="mt-1 text-sm text-muted">Consultando datos del servidor.</p>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
        <EmptyState
          icon={AlertCircle}
          title="No se pudo cargar el reporte"
          description={getApiErrorMessage(error)}
          action={
            onRetry ? (
              <Button type="button" variant="outline" className="bg-surface" onClick={onRetry}>
                Reintentar
              </Button>
            ) : undefined
          }
        />
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card>
        <EmptyState
          icon={ChartColumn}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Card>
    )
  }

  return <>{children}</>
}

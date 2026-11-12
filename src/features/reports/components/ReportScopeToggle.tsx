import { Building2, Layers } from 'lucide-react'
import { useReportScope } from '@/features/reports/hooks/use-report-scope'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import { cn } from '@/lib/utils/cn'

type ReportScopeToggleProps = {
  className?: string
}

/** Alterna reporte de la sucursal operativa vs consolidado (ADMIN, sin header). */
export function ReportScopeToggle({ className }: ReportScopeToggleProps) {
  const { isAdmin, consolidated, setConsolidated } = useReportScope()
  const { sucursal } = useSucursal()

  if (!isAdmin) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-1.5',
        className,
      )}
      role="group"
      aria-label="Alcance del reporte"
    >
      <button
        type="button"
        onClick={() => setConsolidated(false)}
        className={cn(
          'inline-flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
          !consolidated
            ? 'bg-primary text-primary-foreground'
            : 'text-muted hover:bg-surface-muted hover:text-foreground',
        )}
      >
        <Building2 className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{sucursal?.nombre ?? 'Sucursal'}</span>
      </button>
      <button
        type="button"
        onClick={() => setConsolidated(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
          consolidated
            ? 'bg-primary text-primary-foreground'
            : 'text-muted hover:bg-surface-muted hover:text-foreground',
        )}
      >
        <Layers className="size-3.5 shrink-0" aria-hidden />
        Consolidado
      </button>
    </div>
  )
}

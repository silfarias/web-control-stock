import { Outlet } from 'react-router'
import { ChartColumn } from 'lucide-react'
import { ReportNav } from '@/features/reports/components/ReportNav'

export function ReportsLayout() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-10 place-items-center rounded-2xl bg-surface-muted text-primary">
            <ChartColumn className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Reportes</h1>
            <p className="mt-1 text-sm text-muted">
              Indicadores y listados generados por el servidor. Solo disponibles para
              administradores.
            </p>
          </div>
        </div>
        <ReportNav />
      </div>
      <Outlet />
    </div>
  )
}

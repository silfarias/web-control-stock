import { Outlet } from 'react-router'
import { ReportNav } from '@/features/reports/components/ReportNav'

export function ReportsLayout() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Consultá ventas, productos, stock e inventario valorizado.
        </p>
        <ReportNav />
      </div>
      <Outlet />
    </div>
  )
}

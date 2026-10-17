import { Link } from 'react-router'
import {
  AlertTriangle,
  CalendarDays,
  Package,
  ShoppingBag,
  Warehouse,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const reports = [
  {
    to: '/reportes/ventas',
    title: 'Ventas',
    description: 'Totales del período y desglose por método de pago.',
    icon: ShoppingBag,
  },
  {
    to: '/reportes/ventas-diarias',
    title: 'Ventas diarias',
    description: 'Ingresos y cantidad de ventas agrupados por día.',
    icon: CalendarDays,
  },
  {
    to: '/reportes/productos-top',
    title: 'Productos más vendidos',
    description: 'Ranking por unidades vendidas en el período filtrado.',
    icon: Package,
  },
  {
    to: '/reportes/stock-bajo',
    title: 'Stock bajo',
    description: 'Productos con cantidad menor o igual al mínimo configurado.',
    icon: AlertTriangle,
  },
  {
    to: '/reportes/inventario',
    title: 'Inventario valorizado',
    description: 'Stock actual valorizado a costo y a precio de venta.',
    icon: Warehouse,
  },
] as const

export function ReportsHubPage() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => {
        const Icon = report.icon
        return (
          <Link
            key={report.to}
            to={report.to}
            className={cn(
              'group rounded-2xl border border-border bg-surface p-5 transition-colors',
              'hover:border-primary/40 hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            )}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-surface-muted text-primary transition-colors group-hover:bg-primary/10">
              <Icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold tracking-tight">{report.title}</h2>
            <p className="mt-1 text-sm text-muted">{report.description}</p>
          </Link>
        )
      })}
    </div>
  )
}

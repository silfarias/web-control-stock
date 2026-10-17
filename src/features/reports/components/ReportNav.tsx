import { NavLink } from 'react-router'
import { cn } from '@/lib/utils/cn'

const links = [
  { to: '/reportes', end: true, label: 'Resumen' },
  { to: '/reportes/ventas', label: 'Ventas' },
  { to: '/reportes/ventas-diarias', label: 'Ventas diarias' },
  { to: '/reportes/productos-top', label: 'Más vendidos' },
  { to: '/reportes/stock-bajo', label: 'Stock bajo' },
  { to: '/reportes/inventario', label: 'Inventario' },
] as const

export function ReportNav() {
  return (
    <nav
      aria-label="Secciones de reportes"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={'end' in link ? link.end : false}
          className={({ isActive }) =>
            cn(
              'shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:bg-surface-muted hover:text-foreground',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

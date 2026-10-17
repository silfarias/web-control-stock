import { ClipboardList, ShoppingBag, Wallet, Warehouse, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

type Action = {
  title: string
  subtitle: string
  to: string
  icon: LucideIcon
  featured?: boolean
  adminOnly?: boolean
}

const actions: Action[] = [
  {
    title: 'Nueva venta',
    subtitle: 'Registrar cobro',
    to: '/ventas/nueva',
    icon: ShoppingBag,
    featured: true,
  },
  {
    title: 'Nueva compra',
    subtitle: 'Ingreso de mercadería',
    to: '/compras/nueva',
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    title: 'Ver inventario',
    subtitle: 'Stock actual',
    to: '/inventario',
    icon: Warehouse,
  },
  {
    title: 'Caja',
    subtitle: 'Estado y movimientos',
    to: '/caja',
    icon: Wallet,
  },
]

export function QuickActions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const visible = actions.filter((action) => !action.adminOnly || isAdmin)

  return (
    <section aria-labelledby="acciones-rapidas">
      <h2 id="acciones-rapidas" className="text-sm font-semibold">
        Acciones rápidas
      </h2>
      <div
        className={cn(
          'mt-3 grid gap-3',
          visible.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3',
        )}
      >
        {visible.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.title}
              to={action.to}
              className={cn(
                'flex min-w-0 items-center gap-3 rounded-2xl px-3 py-3 transition-colors',
                action.featured
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-surface-muted text-foreground hover:bg-surface-muted-hover',
              )}
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-xl',
                  action.featured ? 'bg-white/15 text-white' : 'bg-surface text-primary',
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{action.title}</span>
                <span
                  className={cn(
                    'block truncate text-xs',
                    action.featured ? 'text-white/75' : 'text-muted',
                  )}
                >
                  {action.subtitle}
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

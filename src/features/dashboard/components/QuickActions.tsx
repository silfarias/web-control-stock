import { ClipboardList, ShoppingBag, Wallet, Warehouse, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils/cn'

const actions: Array<{ title: string; to: string; icon: LucideIcon; featured?: boolean }> = [
  { title: 'Nueva venta', to: '/ventas', icon: ShoppingBag, featured: true },
  { title: 'Nueva compra', to: '/compras', icon: ClipboardList },
  { title: 'Ver inventario', to: '/inventario', icon: Warehouse },
  { title: 'Abrir caja', to: '/caja', icon: Wallet },
]

export function QuickActions() {
  return (
    <section aria-labelledby="acciones-rapidas">
      <h2 id="acciones-rapidas" className="text-sm font-semibold">
        Acciones rápidas
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.title}
              to={action.to}
              className={cn(
                'flex min-w-0 items-center gap-3 rounded-2xl px-3 py-3 transition-colors',
                action.featured
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-surface-muted text-foreground hover:bg-[#dce6e0]',
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
                  Próximamente
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

import { useEffect, useMemo, useRef } from 'react'
import { Link, NavLink } from 'react-router'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { BrandMark } from '@/components/navigation/BrandMark'
import { getNavigationForRole } from '@/components/navigation/nav-items'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  inert: boolean
  onClose: () => void
  onToggleCollapsed: () => void
}

export function Sidebar({
  collapsed,
  mobileOpen,
  inert,
  onClose,
  onToggleCollapsed,
}: SidebarProps) {
  const { user } = useAuth()
  const sections = useMemo(() => getNavigationForRole(user?.role), [user?.role])
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (mobileOpen) closeRef.current?.focus()
  }, [mobileOpen])

  return (
    <aside
      inert={inert}
      aria-label="Navegación principal"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-svh w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[transform,width] duration-200 ease-out lg:relative lg:inset-auto lg:h-full lg:max-h-full lg:translate-x-0',
        collapsed && 'lg:w-[76px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4',
          collapsed && 'lg:justify-center lg:px-2',
        )}
      >
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-offset-2"
          onClick={onClose}
        >
          <BrandMark />
          <span className={cn('min-w-0', collapsed && 'lg:sr-only')}>
            <span className="block truncate text-sm font-semibold tracking-tight">
              Control de stock
            </span>
            <span className="block truncate text-xs text-sidebar-muted">Gestión comercial</span>
          </span>
        </Link>
        <button
          ref={closeRef}
          type="button"
          className="ml-auto grid size-9 place-items-center rounded-xl text-sidebar-foreground hover:bg-white/10 lg:hidden"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <p
              className={cn(
                'px-3 pb-1 text-[11px] font-semibold tracking-[0.14em] text-sidebar-muted uppercase',
                collapsed && 'lg:sr-only',
              )}
            >
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={item.title}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-white/10 focus-visible:outline-offset-[-2px]',
                      collapsed && 'lg:justify-center lg:px-0',
                      isActive && 'bg-background text-sidebar hover:bg-background',
                    )
                  }
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className={cn('truncate', collapsed && 'lg:sr-only')}>{item.title}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="hidden shrink-0 border-t border-white/10 p-3 lg:block">
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/10 hover:text-sidebar-foreground focus-visible:outline-offset-[-2px]',
            collapsed && 'justify-center px-0',
          )}
          onClick={onToggleCollapsed}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="size-[18px]" strokeWidth={1.75} />
          )}
          <span className={cn(collapsed && 'sr-only')}>
            {collapsed ? 'Expandir menú' : 'Contraer menú'}
          </span>
        </button>
      </div>
    </aside>
  )
}

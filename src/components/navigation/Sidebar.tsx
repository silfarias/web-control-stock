import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { BrandMark } from '@/components/navigation/BrandMark'
import { getNavigationForRole, type NavChild } from '@/components/navigation/nav-items'
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
  const { pathname } = useLocation()
  const sections = useMemo(() => getNavigationForRole(user?.role), [user?.role])
  const closeRef = useRef<HTMLButtonElement>(null)
  const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>({})

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
              const children = item.children ?? []
              const routeOpen = children.some((child) => isChildActive(child, children, pathname))
              const submenuVisible = mobileOpen || !collapsed
              const sectionOpen = routeOpen && !collapsedMenus[item.to]

              return (
                <div key={item.to} className="flex flex-col gap-1">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    title={item.title}
                    aria-expanded={children.length > 0 ? sectionOpen : undefined}
                    onClick={(event) => {
                      if (children.length > 0 && routeOpen && submenuVisible) {
                        event.preventDefault()
                        setCollapsedMenus((current) => ({
                          ...current,
                          [item.to]: !current[item.to],
                        }))
                        return
                      }
                      if (children.length > 0) {
                        setCollapsedMenus((current) => ({ ...current, [item.to]: false }))
                      }
                      onClose()
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-white/10 focus-visible:outline-offset-[-2px]',
                        collapsed && 'lg:justify-center lg:px-0',
                        isActive &&
                          children.length === 0 &&
                          'bg-background text-sidebar hover:bg-background',
                        sectionOpen && 'bg-white/10 text-sidebar-foreground hover:bg-white/15',
                        collapsed &&
                          sectionOpen &&
                          'lg:bg-background lg:text-sidebar lg:hover:bg-background',
                      )
                    }
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className={cn('truncate', collapsed && 'lg:sr-only')}>{item.title}</span>
                    {children.length > 0 ? (
                      <ChevronDown
                        className={cn(
                          'ml-auto size-4 shrink-0 text-sidebar-muted transition-transform duration-200',
                          sectionOpen && 'rotate-180',
                          collapsed && 'lg:hidden',
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </NavLink>
                  {children.length > 0 ? (
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows] duration-200 ease-out',
                        sectionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                        collapsed && 'lg:hidden',
                      )}
                    >
                      <div className="overflow-hidden" inert={!sectionOpen}>
                        <div
                          className={cn(
                            'flex flex-col gap-0.5 pt-1 pl-4 transition-opacity duration-200',
                            sectionOpen ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          {children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              end
                              title={child.title}
                              tabIndex={sectionOpen ? undefined : -1}
                              onClick={onClose}
                              className={() => {
                                const active = isChildActive(child, children, pathname)
                                return cn(
                                  'flex h-9 items-center rounded-xl px-3 text-sm transition-colors focus-visible:outline-offset-[-2px]',
                                  active
                                    ? 'bg-background font-medium text-sidebar'
                                    : 'text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground',
                                )
                              }}
                            >
                              <span className="truncate">{child.title}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
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
          {/* <span className={cn(collapsed && 'sr-only')}>
            {collapsed ? 'Expandir menú' : 'Contraer menú'}
          </span> */}
        </button>
      </div>
    </aside>
  )
}

function isChildActive(child: NavChild, siblings: NavChild[], pathname: string) {
  if (pathname === child.to) return true
  if (!pathname.startsWith(`${child.to}/`)) return false
  const coveredBySibling = siblings.some(
    (other) =>
      other.to !== child.to &&
      other.to.length > child.to.length &&
      (pathname === other.to || pathname.startsWith(`${other.to}/`)),
  )
  return !coveredBySibling
}

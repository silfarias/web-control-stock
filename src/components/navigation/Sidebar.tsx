import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { BrandMark } from '@/components/navigation/BrandMark'
import { getNavigationForRole, type NavChild } from '@/components/navigation/nav-items'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/Sheet'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  inert?: boolean
  onClose: () => void
  onToggleCollapsed: () => void
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggleCollapsed,
}: SidebarProps) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const sections = useMemo(() => getNavigationForRole(user?.role), [user?.role])
  const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>({})

  const desktop = (
    <aside
      aria-label="Navegación principal"
      className={cn(
        'relative hidden h-full max-h-full w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out lg:flex',
        collapsed && 'lg:w-[76px]',
      )}
    >
      <SidebarChrome
        collapsed={collapsed}
        mobile={false}
        sections={sections}
        pathname={pathname}
        collapsedMenus={collapsedMenus}
        setCollapsedMenus={setCollapsedMenus}
        onClose={onClose}
        onToggleCollapsed={onToggleCollapsed}
      />
    </aside>
  )

  return (
    <>
      {desktop}
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <SheetContent
          side="left"
          showClose
          className="gap-0 border-0 bg-sidebar p-0 text-sidebar-foreground lg:hidden [&_button.absolute]:text-sidebar-foreground [&_button.absolute]:hover:bg-white/10"
        >
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <SheetDescription className="sr-only">
            Secciones del sistema de control de stock
          </SheetDescription>
          <SidebarChrome
            collapsed={false}
            mobile
            sections={sections}
            pathname={pathname}
            collapsedMenus={collapsedMenus}
            setCollapsedMenus={setCollapsedMenus}
            onClose={onClose}
            onToggleCollapsed={onToggleCollapsed}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

type Section = ReturnType<typeof getNavigationForRole>[number]

function SidebarChrome({
  collapsed,
  mobile,
  sections,
  pathname,
  collapsedMenus,
  setCollapsedMenus,
  onClose,
  onToggleCollapsed,
}: {
  collapsed: boolean
  mobile: boolean
  sections: Section[]
  pathname: string
  collapsedMenus: Record<string, boolean>
  setCollapsedMenus: Dispatch<SetStateAction<Record<string, boolean>>>
  onClose: () => void
  onToggleCollapsed: () => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4',
          collapsed && !mobile && 'lg:justify-center lg:px-2',
          mobile && 'pr-12',
        )}
      >
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-offset-2"
          onClick={onClose}
        >
          <BrandMark />
          <span className={cn('min-w-0', collapsed && !mobile && 'lg:sr-only')}>
            <span className="block truncate text-sm font-semibold tracking-tight">
              Control de stock
            </span>
            <span className="block truncate text-xs text-sidebar-muted">Gestión comercial</span>
          </span>
        </Link>
      </div>

      <nav className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <p
              className={cn(
                'px-3 pb-1 text-[11px] font-semibold tracking-[0.14em] text-sidebar-muted uppercase',
                collapsed && !mobile && 'lg:sr-only',
              )}
            >
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const children = item.children ?? []
              const routeOpen = children.some((child) => isChildActive(child, children, pathname))
              const submenuVisible = mobile || !collapsed
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
                        collapsed && !mobile && 'lg:justify-center lg:px-0',
                        isActive &&
                          children.length === 0 &&
                          'bg-background text-sidebar hover:bg-background',
                        sectionOpen && 'bg-white/10 text-sidebar-foreground hover:bg-white/15',
                        collapsed &&
                          !mobile &&
                          sectionOpen &&
                          'lg:bg-background lg:text-sidebar lg:hover:bg-background',
                      )
                    }
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className={cn('truncate', collapsed && !mobile && 'lg:sr-only')}>
                      {item.title}
                    </span>
                    {children.length > 0 ? (
                      <ChevronDown
                        className={cn(
                          'ml-auto size-4 shrink-0 text-sidebar-muted transition-transform duration-200',
                          sectionOpen && 'rotate-180',
                          collapsed && !mobile && 'lg:hidden',
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
                        collapsed && !mobile && 'lg:hidden',
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

      {!mobile ? (
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
          </button>
        </div>
      ) : null}
    </div>
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

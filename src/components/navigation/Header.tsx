import type { RefObject } from 'react'
import { Link, useLocation, useMatches } from 'react-router'
import { ChevronRight, Menu } from 'lucide-react'
import { HeaderClock } from '@/components/navigation/HeaderClock'
import { navigation } from '@/components/navigation/nav-items'
import { UserMenu } from '@/components/navigation/UserMenu'
import { getRouteHandle } from '@/app/router/route-handle'

type HeaderProps = {
  onOpenMenu: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

function hrefForCrumb(label: string) {
  if (label === 'Inicio') return '/'
  for (const section of navigation) {
    const item = section.items.find((entry) => entry.title === label)
    if (item) return item.to
  }
  return null
}

export function Header({ onOpenMenu, menuButtonRef }: HeaderProps) {
  const location = useLocation()
  const matches = useMatches()
  const handle = getRouteHandle(matches)
  const crumbs = (handle.breadcrumb ?? []).filter((crumb, index, all) => {
    const repeatsTitle = index === all.length - 1 && crumb === handle.title
    return !repeatsTitle
  })
  const showBreadcrumb = crumbs.length > 0 && crumbs.some((crumb) => crumb !== 'Inicio')

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:gap-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <button
          ref={menuButtonRef}
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-xl text-foreground transition-colors hover:bg-surface-muted lg:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex min-w-0 flex-col justify-center">
          {showBreadcrumb ? (
            <nav
              aria-label="Miga de pan"
              className="mb-0.5 flex min-w-0 items-center gap-1 text-xs text-muted"
            >
              {crumbs.map((crumb, index) => {
                const href = hrefForCrumb(crumb)
                const isLast = index === crumbs.length - 1
                return (
                  <span key={`${crumb}-${index}`} className="flex min-w-0 items-center gap-1">
                    {index > 0 ? <ChevronRight className="size-3 shrink-0" aria-hidden /> : null}
                    {href ? (
                      <Link
                        to={href}
                        className={
                          isLast
                            ? 'truncate text-foreground transition-colors hover:text-primary'
                            : 'shrink-0 transition-colors hover:text-foreground'
                        }
                      >
                        {crumb}
                      </Link>
                    ) : (
                      <span className={isLast ? 'truncate text-foreground' : 'shrink-0'}>
                        {crumb}
                      </span>
                    )}
                  </span>
                )
              })}
            </nav>
          ) : null}
          <h1 className="truncate text-base leading-tight font-semibold tracking-tight">
            {handle.title}
          </h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <HeaderClock />
        <UserMenu key={location.pathname} />
      </div>
    </header>
  )
}

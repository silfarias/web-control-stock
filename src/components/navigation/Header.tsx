import type { RefObject } from 'react'
import { Link, useLocation, useMatches } from 'react-router'
import { ChevronRight, Menu } from 'lucide-react'
import { UserMenu } from '@/components/navigation/UserMenu'
import { getRouteHandle } from '@/app/router/route-handle'

type HeaderProps = {
  onOpenMenu: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

export function Header({ onOpenMenu, menuButtonRef }: HeaderProps) {
  const location = useLocation()
  const matches = useMatches()
  const handle = getRouteHandle(matches)
  const showBreadcrumb = (handle.breadcrumb?.length ?? 0) > 1

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
              <Link to="/" className="shrink-0 transition-colors hover:text-foreground">
                Inicio
              </Link>
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <span className="truncate text-foreground">{handle.title}</span>
            </nav>
          ) : null}
          <h1 className="truncate text-base leading-tight font-semibold tracking-tight">
            {handle.title}
          </h1>
        </div>
      </div>
      <div className="shrink-0">
        <UserMenu key={location.pathname} />
      </div>
    </header>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router'
import { getRouteHandle } from '@/app/router/route-handle'
import { Header } from '@/components/navigation/Header'
import { Sidebar } from '@/components/navigation/Sidebar'

const collapsedStorageKey = 'sidebar-collapsed'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

export function AppLayout() {
  const isDesktop = useIsDesktop()
  const location = useLocation()
  const matches = useMatches()
  const handle = getRouteHandle(matches)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const wasMobileOpen = useRef(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(collapsedStorageKey) === 'true',
  )
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const drawerOpen = menuPath === location.pathname && !isDesktop

  useEffect(() => {
    localStorage.setItem(collapsedStorageKey, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    document.title = `${handle.title} · Control de stock`
  }, [handle.title])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuPath(null)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  useEffect(() => {
    if (wasMobileOpen.current && !drawerOpen && !isDesktop) {
      menuButtonRef.current?.focus()
    }
    wasMobileOpen.current = drawerOpen
  }, [drawerOpen, isDesktop])

  return (
    <div className="flex h-svh max-h-svh overflow-hidden bg-background text-foreground">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-xl focus:bg-surface focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40"
          aria-label="Cerrar menú"
          onClick={() => setMenuPath(null)}
        />
      ) : null}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={drawerOpen}
        inert={!drawerOpen && !isDesktop}
        onClose={() => setMenuPath(null)}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        inert={drawerOpen ? true : undefined}
      >
        <Header
          onOpenMenu={() => setMenuPath(location.pathname)}
          menuButtonRef={menuButtonRef}
        />
        <main
          ref={mainRef}
          id="contenido"
          className="panel-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-6 md:px-8 md:py-8"
        >
          <div className="mx-auto w-full max-w-[1240px] min-w-0 pb-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

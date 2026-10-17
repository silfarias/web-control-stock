import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { LoaderCircle, UserRound } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getRoleLabel } from '@/features/auth/utils/role-label'
import { Button } from '@/components/ui/Button'

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      setOpen(false)
      void navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  if (!user) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pr-2.5 pl-1 transition-colors hover:bg-surface-muted sm:gap-3 sm:pr-3"
        aria-expanded={open}
        aria-controls="menu-cuenta"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary text-white">
          <UserRound className="size-4" aria-hidden />
        </span>
        <span className="hidden max-w-[10rem] text-left sm:block">
          <span className="block truncate text-sm leading-tight font-semibold">{user.nombre}</span>
          <span className="block truncate text-xs text-muted">{getRoleLabel(user.role)}</span>
        </span>
      </button>

      {open ? (
        <div
          id="menu-cuenta"
          role="dialog"
          aria-label="Cuenta"
          className="absolute top-12 right-0 z-40 w-72 rounded-2xl border border-border bg-surface p-4"
        >
          <p className="truncate text-sm font-semibold">{user.nombre}</p>
          <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
          <p className="mt-2 text-xs font-medium tracking-wide text-muted uppercase">
            {getRoleLabel(user.role)}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Cerrando…
              </>
            ) : (
              'Cerrar sesión'
            )}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

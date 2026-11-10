import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LoaderCircle, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getRoleLabel } from '@/features/auth/utils/role-label'
import { Badge } from '@/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Separator } from '@/components/ui/Separator'

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      void navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pr-2.5 pl-1 transition-colors hover:bg-surface-muted sm:gap-3 sm:pr-3"
          aria-label="Menú de cuenta"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <UserRound className="size-4" aria-hidden />
          </span>
          <span className="hidden max-w-[10rem] text-left sm:block">
            <span className="block truncate text-sm leading-tight font-semibold">{user.nombre}</span>
            <span className="block truncate text-xs text-muted">{getRoleLabel(user.role)}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <div className="px-2 py-2">
          <p className="truncate text-sm font-semibold">{user.nombre}</p>
          <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
          <Badge tone="accent" className="mt-3">
            {getRoleLabel(user.role)}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => {
            void navigate('/perfil')
          }}
        >
          <UserRound className="size-4 text-muted" aria-hidden />
          Mi perfil
        </DropdownMenuItem>
        <Separator className="my-1.5" />
        <DropdownMenuItem
          disabled={loggingOut}
          className="text-error-ink focus:bg-error-soft focus:text-error-ink"
          onSelect={() => {
            void handleLogout()
          }}
        >
          {loggingOut ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <LogOut className="size-4" aria-hidden />
          )}
          {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

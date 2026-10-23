import { Link, useLocation } from 'react-router'
import { buttonVariants } from '@/components/ui/button-variants'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { findNavItem } from '@/components/navigation/nav-items'
import { NotFoundPage } from '@/components/common/NotFoundPage'

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const item = findNavItem(pathname)

  if (!item) return <NotFoundPage />

  const Icon = item.icon

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md px-6 py-10 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {item.description ?? 'Este módulo se va a incorporar en una próxima etapa.'}
        </p>
        <Badge tone="accent" className="mt-4">
          Próximamente
        </Badge>
        <div className="mt-6">
          <Link to="/" className={buttonVariants()}>
            Volver al panel
          </Link>
        </div>
      </Card>
    </div>
  )
}

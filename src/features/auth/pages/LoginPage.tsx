import { useEffect } from 'react'
import { BrandMark } from '@/components/navigation/BrandMark'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  useEffect(() => {
    document.title = 'Iniciar sesión · Control de stock'
  }, [])

  return (
    <div className="panel-scroll h-svh max-h-svh overflow-y-auto overscroll-y-contain bg-background text-foreground">
      <div className="mx-auto grid min-h-full w-full max-w-6xl lg:min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-sidebar px-10 py-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-accent/30" />
          <div className="pointer-events-none absolute right-16 bottom-20 size-40 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold tracking-tight">Control de stock</p>
              <p className="text-xs text-sidebar-muted">Gestión comercial</p>
            </div>
          </div>

          <div className="relative max-w-md">
            <p className="text-xs font-semibold tracking-[0.16em] text-sidebar-muted uppercase">
              Acceso seguro
            </p>
            <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight">
              Operá el día a día del comercio desde un solo lugar.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-sidebar-muted">
              Stock, ventas, compras y caja con una interfaz clara, pensada para el trabajo
              cotidiano.
            </p>
          </div>

          <p className="relative text-xs text-sidebar-muted">
            Usá tu cuenta del sistema para continuar.
          </p>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <BrandMark />
              <div>
                <p className="text-sm font-semibold tracking-tight">Control de stock</p>
                <p className="text-xs text-muted">Gestión comercial</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Ingresá tus credenciales para acceder al panel.
              </p>
              <div className="mt-8">
                <LoginForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

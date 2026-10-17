import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  ToastContext,
  type ToastInput,
  type ToastTone,
} from '@/components/common/toast-context'
import { cn } from '@/lib/utils/cn'

type ToastItem = ToastInput & {
  id: string
  tone: ToastTone
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID()
      const next: ToastItem = {
        id,
        title: toast.title,
        description: toast.description,
        tone: toast.tone ?? 'info',
      }
      setToasts((current) => [...current, next])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-2xl border px-4 py-3 shadow-none',
              toast.tone === 'success' && 'border-success/20 bg-success-soft text-success-ink',
              toast.tone === 'error' && 'border-error/20 bg-error-soft text-error-ink',
              toast.tone === 'info' && 'border-border bg-surface text-foreground',
            )}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-sm opacity-90">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-lg opacity-70 transition-opacity hover:opacity-100"
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

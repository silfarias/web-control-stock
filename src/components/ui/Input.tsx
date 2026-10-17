import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/lib/utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  /** Prefijo visual dentro del campo (p. ej. "$"). */
  prefix?: string
  /** Icono a la izquierda (p. ej. lupa de búsqueda). */
  leadingIcon?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function Input({
  className,
  label,
  error,
  hint,
  prefix,
  leadingIcon,
  id,
  type = 'text',
  ref,
  ...props
}: InputProps) {
  const inputId = id ?? props.name
  const hasLeading = Boolean(leadingIcon) || Boolean(prefix)

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {props.required ? <span className="text-error"> *</span> : null}
        </span>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-muted">
            {leadingIcon}
          </span>
        ) : null}
        {prefix && !leadingIcon ? (
          <span
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-muted tabular-nums"
            aria-hidden
          >
            {prefix}
          </span>
        ) : null}
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'h-11 w-full rounded-xl border border-border bg-surface text-sm text-foreground transition-colors placeholder:text-muted',
            'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
            error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
            hasLeading ? 'py-0 pr-3.5 pl-10' : 'px-3.5',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        />
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-error-ink" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  )
}

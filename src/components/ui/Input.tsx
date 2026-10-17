import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  ref?: Ref<HTMLInputElement>
}

export function Input({
  className,
  label,
  error,
  hint,
  id,
  type = 'text',
  ref,
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {props.required ? <span className="text-error"> *</span> : null}
        </span>
      ) : null}
      <input
        {...props}
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors placeholder:text-muted',
          'hover:border-[#c5d0c8] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
          error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
      />
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

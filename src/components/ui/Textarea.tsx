import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({
  className,
  label,
  error,
  hint,
  id,
  rows = 3,
  ref,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {props.required ? <span className="text-error"> *</span> : null}
        </span>
      ) : null}
      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted',
          'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
          error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
      />
      {error ? (
        <span id={`${textareaId}-error`} className="text-xs text-error-ink" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${textareaId}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  )
}

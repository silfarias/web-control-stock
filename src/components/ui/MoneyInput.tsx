import type { ComponentProps, Ref } from 'react'
import { NumericFormat, type NumberFormatValues } from 'react-number-format'
import { cn } from '@/lib/utils/cn'

type MoneyInputProps = {
  label?: string
  error?: string
  hint?: string
  /** Prefijo visual a la izquierda (p. ej. "$"). */
  prefix?: string
  required?: boolean
  disabled?: boolean
  name?: string
  id?: string
  placeholder?: string
  autoFocus?: boolean
  className?: string
  /** String numérico sin miles (ej. `"1500.5"`). */
  value?: string
  onValueChange?: (values: NumberFormatValues) => void
  onBlur?: ComponentProps<'input'>['onBlur']
  getInputRef?: Ref<HTMLInputElement>
}

/**
 * Input monetario con separador de miles (`.`) y decimal (`,`) estilo es-AR.
 * El valor controlado es el string numérico limpio (`values.value` de NumericFormat).
 */
export function MoneyInput({
  label,
  error,
  hint,
  prefix,
  required,
  disabled,
  name,
  id,
  placeholder = '0,00',
  autoFocus,
  className,
  value,
  onValueChange,
  onBlur,
  getInputRef,
}: MoneyInputProps) {
  const inputId = id ?? name
  const hasPrefix = Boolean(prefix)

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </span>
      ) : null}
      <div className="relative">
        {hasPrefix ? (
          <span
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-muted tabular-nums"
            aria-hidden
          >
            {prefix}
          </span>
        ) : null}
        <NumericFormat
          value={value ?? ''}
          valueIsNumericString
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          allowNegative={false}
          allowedDecimalSeparators={[',', '.']}
          inputMode="decimal"
          name={name}
          id={inputId}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          getInputRef={getInputRef}
          onValueChange={onValueChange}
          onBlur={onBlur}
          className={cn(
            'h-11 w-full rounded-xl border border-border bg-surface text-sm text-foreground tabular-nums transition-colors placeholder:text-muted',
            'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
            hasPrefix ? 'py-0 pr-3.5 pl-10' : 'px-3.5',
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

import type { FocusEvent, InputHTMLAttributes, KeyboardEvent, Ref } from 'react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'

type QuantityInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'min' | 'step'
> & {
  value: string
  onChange: (value: string) => void
  min?: number
  error?: string
  ref?: Ref<HTMLInputElement>
}

function parseQuantity(value: string, min: number) {
  if (!/^\d+$/.test(value.trim())) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < min) return null
  return n
}

/** Entero positivo (mínimo 1). `+`/`-` y flechas ajustan la cantidad. */
export function QuantityInput({
  value,
  onChange,
  min = 1,
  error,
  disabled,
  className,
  onBlur,
  onKeyDown,
  onFocus,
  ref,
  ...props
}: QuantityInputProps) {
  function commit(next: number) {
    onChange(String(Math.max(min, Math.trunc(next))))
  }

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, '')
    onChange(digits)
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const parsed = parseQuantity(value, min)
    if (parsed == null) onChange(String(min))
    else onChange(String(parsed))
    onBlur?.(event)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return

    const current = parseQuantity(value, min) ?? min

    if (event.key === '+' || event.key === '=' || event.key === 'ArrowUp') {
      event.preventDefault()
      commit(current + 1)
      return
    }

    if (event.key === '-' || event.key === 'ArrowDown') {
      event.preventDefault()
      commit(current - 1)
    }
  }

  return (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      disabled={disabled}
      error={error}
      value={value}
      data-qty-input=""
      className={cn('tabular-nums', className)}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={handleBlur}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
    />
  )
}

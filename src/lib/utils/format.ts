const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const longDateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

/** Formato monetario con decimales para precios de catálogo. */
export function formatMoney(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(amount)) return '—'
  return moneyFormatter.format(amount)
}

export function formatLongDate(date: Date) {
  const formatted = longDateFormatter.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function getGreeting(date: Date = new Date()) {
  const hour = date.getHours()
  if (hour < 6 || hour >= 20) return 'Buenas noches'
  if (hour < 12) return 'Buen día'
  return 'Buenas tardes'
}

const shortDateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/**
 * Interpreta `YYYY-MM-DD` como fecha de calendario local (sin shift UTC).
 * Otras cadenas ISO / Date se formatean con el timezone del entorno.
 */
export function formatShortDate(value: string | Date) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    if (dateOnly) {
      const date = new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
      if (Number.isNaN(date.getTime())) return '—'
      return shortDateFormatter.format(date)
    }
  }

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return shortDateFormatter.format(date)
}

const timeFormatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatTime(date: Date = new Date()) {
  return timeFormatter.format(date)
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return dateTimeFormatter.format(date)
}

/** Comprobante visible de venta, compra o caja: 000007. */
export function formatComprobante(numero: number | string | null | undefined) {
  const value = typeof numero === 'string' ? Number(numero) : numero
  if (value == null || !Number.isFinite(value)) return '—'
  return String(Math.trunc(value)).padStart(6, '0')
}

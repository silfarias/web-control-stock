/** Valor numérico limpio que guarda el formulario (sin miles; decimal con `.`). */
const numericMoneyRegex = /^\d+(\.\d{1,2})?$/

/** También acepta formato visual es-AR (`1.234,56`) por compatibilidad. */
const formattedMoneyRegex = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/

export function isValidMoneyInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  return numericMoneyRegex.test(trimmed) || formattedMoneyRegex.test(trimmed)
}

/**
 * Parsea un importe desde el valor del formulario.
 * Acepta string numérico (`1500.5`) o formateado es-AR (`1.500,50`).
 */
export function parseMoneyInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return Number.NaN

  if (trimmed.includes(',')) {
    return Number(trimmed.replace(/\./g, '').replace(',', '.'))
  }

  // Miles sin decimales: "1.500" → 1500 (no confundir con decimal anglosajón)
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    return Number(trimmed.replace(/\./g, ''))
  }

  return Number(trimmed)
}

/** Normaliza un número/string de API al string numérico que usa MoneyInput. */
export function toMoneyInputValue(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(amount)) return ''
  return String(Number(amount.toFixed(2)))
}

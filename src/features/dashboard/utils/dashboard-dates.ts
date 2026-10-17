/** Fecha local YYYY-MM-DD (sin UTC). */
export function toLocalIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addLocalDays(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + deltaDays)
  return toLocalIsoDate(date)
}

export function lastNLocalDates(n: number, today = new Date()): string[] {
  const end = toLocalIsoDate(today)
  return Array.from({ length: n }, (_, index) => addLocalDays(end, -(n - 1 - index)))
}

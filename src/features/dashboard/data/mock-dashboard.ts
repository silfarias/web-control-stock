export type PaymentMethod =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'TARJETA_DEBITO'
  | 'TARJETA_CREDITO'

export type DashboardSummary = {
  salesToday: number
  salesDetail: string
  products: number
  productsDetail: string
  lowStock: number
  lowStockDetail: string
  movements: number
  movementsDetail: string
}

export type SalesPoint = {
  label: string
  fullLabel: string
  value: number
}

export type RecentSale = {
  id: string
  time: string
  payment: PaymentMethod
  items: number
  total: number
}

export type LowStockItem = {
  name: string
  sku: string
  stock: number
  minimum: number
}

export const dashboardSummary: DashboardSummary = {
  salesToday: 186_400,
  salesDetail: '14 operaciones en el día',
  products: 146,
  productsDetail: 'En 12 categorías',
  lowStock: 5,
  lowStockDetail: 'Por debajo del mínimo',
  movements: 18,
  movementsDetail: '11 entradas · 7 salidas',
}

const salesValues = [112_400, 156_800, 148_200, 171_500, 163_900, 198_400, 186_400]

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getSalesSeries(today = new Date()): SalesPoint[] {
  const shortFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
  const fullFormatter = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

  return salesValues.map((value, index) => {
    const date = new Date(today)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (salesValues.length - 1 - index))

    return {
      label: capitalize(shortFormatter.format(date).replaceAll('.', '')),
      fullLabel: capitalize(fullFormatter.format(date).replaceAll('.', '')),
      value,
    }
  })
}

export const recentSales: RecentSale[] = [
  { id: 'V-10428', time: '09:12', payment: 'EFECTIVO', items: 4, total: 18_750 },
  { id: 'V-10429', time: '10:04', payment: 'TRANSFERENCIA', items: 2, total: 9_200 },
  { id: 'V-10430', time: '11:26', payment: 'TARJETA_DEBITO', items: 6, total: 27_430 },
  { id: 'V-10431', time: '12:48', payment: 'EFECTIVO', items: 1, total: 3_150 },
  { id: 'V-10432', time: '14:05', payment: 'TARJETA_CREDITO', items: 3, total: 21_890 },
  { id: 'V-10433', time: '16:22', payment: 'EFECTIVO', items: 5, total: 14_680 },
]

export const lowStockItems: LowStockItem[] = [
  { name: 'Agua mineral sin gas 1,5 L', sku: 'AGU-1500', stock: 3, minimum: 12 },
  { name: 'Pilas alcalinas AA, pack x4', sku: 'PIL-AA4', stock: 2, minimum: 10 },
  { name: 'Lámpara LED 9 W', sku: 'LED-9W', stock: 4, minimum: 12 },
  { name: 'Detergente neutro 750 ml', sku: 'DET-750', stock: 5, minimum: 16 },
  { name: 'Cuaderno A4 48 hojas', sku: 'CUA-A4', stock: 6, minimum: 18 },
]

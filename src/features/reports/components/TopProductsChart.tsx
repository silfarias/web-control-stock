import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartFrame, ChartTooltipCard } from '@/components/ui/chart'
import type { ReporteProductoTopItem } from '@/features/reports/types'
import { formatMoney } from '@/lib/utils/format'

const CHART_LIMIT = 8

type ChartRow = {
  nombre: string
  codigo: string
  cantidadVendida: number
  totalVendido: number
}

function shortName(name: string) {
  return name.length > 22 ? `${name.slice(0, 20)}…` : name
}

function topInsight(items: ReporteProductoTopItem[]) {
  const total = items.reduce((sum, item) => sum + Number(item.totalVendido), 0)
  if (total <= 0) return ''
  const leader = [...items].sort(
    (a, b) => Number(b.totalVendido) - Number(a.totalVendido),
  )[0]
  if (!leader) return ''
  const share = Math.round((Number(leader.totalVendido) / total) * 100)
  if (items.length === 1) {
    return `${leader.nombre} sumó ${formatMoney(leader.totalVendido)} en ${leader.cantidadVendida} unidades.`
  }
  return `${leader.nombre} es el que más ingresó: ${formatMoney(leader.totalVendido)}, el ${share}% de este ranking, con ${leader.cantidadVendida} unidades.`
}

function TopTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: ChartRow }>
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <ChartTooltipCard
      title={point.nombre}
      rows={[
        { label: 'Código', value: point.codigo },
        { label: 'Ingresos', value: formatMoney(point.totalVendido) },
        { label: 'Unidades', value: String(point.cantidadVendida) },
      ]}
    />
  )
}

type TopProductsChartProps = {
  items: ReporteProductoTopItem[]
}

export function TopProductsChart({ items }: TopProductsChartProps) {
  const rows = [...items]
    .map((item) => ({
      nombre: item.nombre,
      codigo: item.codigo,
      cantidadVendida: Number(item.cantidadVendida) || 0,
      totalVendido: Number(item.totalVendido) || 0,
    }))
    .sort((a, b) => b.totalVendido - a.totalVendido)
    .slice(0, CHART_LIMIT)
    .reverse()

  if (rows.length === 0 || rows.every((row) => row.totalVendido <= 0)) return null

  const insight = topInsight(items)
  const hidden = items.length > rows.length

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="text-sm font-semibold tracking-tight">Qué productos sostienen los ingresos</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        {insight} La tabla de abajo sigue ordenada por unidades.
        {hidden ? ` El gráfico muestra los ${rows.length} de mayor ingreso.` : ''}
      </p>
      <ChartFrame className="mt-4" style={{ height: Math.max(220, rows.length * 40) }}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
        >
          <XAxis type="number" hide domain={[0, 'auto']} />
          <YAxis
            type="category"
            dataKey="nombre"
            width={148}
            tickFormatter={shortName}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'var(--surface-muted)' }} content={<TopTooltip />} />
          <Bar
            dataKey="totalVendido"
            fill="var(--primary)"
            radius={[0, 4, 4, 0]}
            barSize={16}
            activeBar={{ fill: 'var(--primary-hover)' }}
          />
        </BarChart>
      </ChartFrame>
    </div>
  )
}

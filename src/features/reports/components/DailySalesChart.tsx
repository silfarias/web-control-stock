import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartFrame, ChartTooltipCard } from '@/components/ui/chart'
import { buildDailySeries, dailyInsight, type DailyPoint } from '@/features/reports/utils/daily-series'
import type { ReporteVentasDiarioItem } from '@/features/reports/types'
import { formatMoney, formatShortDate } from '@/lib/utils/format'

const axisDate = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
const axisMoney = new Intl.NumberFormat('es-AR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function dayLabel(fecha: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha)
  if (!match) return fecha
  return axisDate.format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}

function DailyTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: DailyPoint }>
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  const average =
    point.cantidadVentas > 0 ? point.totalIngresos / point.cantidadVentas : null

  return (
    <ChartTooltipCard
      title={formatShortDate(point.fecha)}
      rows={[
        { label: 'Ingresos', value: formatMoney(point.totalIngresos) },
        {
          label: 'Ventas',
          value: point.cantidadVentas === 0 ? 'Sin ventas' : String(point.cantidadVentas),
        },
        ...(average != null ? [{ label: 'Ticket promedio', value: formatMoney(average) }] : []),
      ]}
    />
  )
}

type DailySalesChartProps = {
  items: ReporteVentasDiarioItem[]
}

export function DailySalesChart({ items }: DailySalesChartProps) {
  const { points, filled } = buildDailySeries(items)
  const insight = dailyInsight(points, filled)
  const max = Math.max(...points.map((point) => point.totalIngresos), 0)
  const tickInterval = points.length > 16 ? Math.ceil(points.length / 8) - 1 : 0

  return (
    <div>
      <h3 className="text-sm font-semibold tracking-tight">Ingresos por día</h3>
      {insight ? <p className="mt-1 max-w-3xl text-sm text-muted">{insight}</p> : null}
      <ChartFrame className="mt-4 h-72">
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="fecha"
            tickFormatter={dayLabel}
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <YAxis
            width={56}
            domain={[0, max === 0 ? 1 : 'auto']}
            tickFormatter={(value: number) => axisMoney.format(value)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-muted)' }}
            content={<DailyTooltip />}
          />
          <Bar
            dataKey="totalIngresos"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            activeBar={{ fill: 'var(--primary-hover)' }}
          />
        </BarChart>
      </ChartFrame>
    </div>
  )
}

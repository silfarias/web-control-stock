import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import type { SalesPoint } from '@/features/dashboard/data/mock-dashboard'
import { formatCurrency } from '@/lib/utils/format'

const chartBox = {
  width: 640,
  height: 220,
  padLeft: 52,
  padRight: 14,
  padTop: 12,
  padBottom: 28,
}

function buildChart(series: SalesPoint[]) {
  const values = series.map((point) => point.value)
  const min = Math.min(...values) * 0.8
  const max = Math.max(...values) * 1.08
  const innerWidth = chartBox.width - chartBox.padLeft - chartBox.padRight
  const innerHeight = chartBox.height - chartBox.padTop - chartBox.padBottom
  const points = series.map((point, index) => ({
    ...point,
    x:
      chartBox.padLeft +
      (series.length === 1 ? innerWidth / 2 : (index * innerWidth) / (series.length - 1)),
    y: chartBox.padTop + ((max - point.value) / (max - min)) * innerHeight,
  }))
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
  const baseline = chartBox.height - chartBox.padBottom
  const first = points[0]
  const last = points[points.length - 1]
  const area =
    first && last
      ? `${line} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`
      : ''
  const ticks = [0, 0.5, 1].map((progress) => ({
    y: chartBox.padTop + progress * innerHeight,
    value: max - progress * (max - min),
  }))

  return { points, line, area, ticks }
}

export function SalesChart({ series }: { series: SalesPoint[] }) {
  const chart = buildChart(series)
  const [activeIndex, setActiveIndex] = useState(Math.max(series.length - 1, 0))
  const active = chart.points[activeIndex]
  const peak = series.reduce<SalesPoint | undefined>((best, point) => {
    if (!best || point.value > best.value) return point
    return best
  }, undefined)

  if (!active || !peak) return null

  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Ventas</h2>
          <p className="mt-1 text-sm text-muted">Últimos 7 días</p>
        </div>
        <p className="min-w-0 text-sm text-muted sm:text-right">
          <span className="block truncate">{active.fullLabel}</span>
          <span className="mt-0.5 block text-base font-semibold text-foreground tabular-nums">
            {formatCurrency(active.value)}
          </span>
        </p>
      </div>

      <div className="mt-4 min-w-0 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartBox.width} ${chartBox.height}`}
          className="h-auto w-full min-w-[280px]"
          role="group"
          aria-label="Ventas de los últimos 7 días"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {chart.ticks.map((tick) => (
            <g key={tick.y}>
              <line
                x1={chartBox.padLeft}
                x2={chartBox.width - chartBox.padRight}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--border)"
                strokeDasharray="3 5"
              />
              <text
                x={chartBox.padLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                className="fill-muted"
              >
                {`${Math.round(tick.value / 1000)} mil`}
              </text>
            </g>
          ))}
          <path d={chart.area} fill="url(#sales-fill)" />
          <path
            d={chart.line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <line
            x1={active.x}
            x2={active.x}
            y1={chartBox.padTop}
            y2={chartBox.height - chartBox.padBottom}
            stroke="var(--primary)"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          {chart.points.map((point, index) => {
            const isActive = index === activeIndex

            return (
              <g key={point.fullLabel}>
                <text
                  x={point.x}
                  y={chartBox.height - 6}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-muted"
                >
                  {point.label}
                </text>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? 5.5 : 3.5}
                  fill={isActive ? 'var(--primary)' : 'var(--surface)'}
                  stroke="var(--primary)"
                  strokeWidth="2"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="16"
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.fullLabel}: ${formatCurrency(point.value)}`}
                  className="cursor-pointer outline-none focus-visible:stroke-primary"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                />
              </g>
            )
          })}
        </svg>
        <p className="mt-2 text-xs text-muted">
          Mayor venta: {peak.fullLabel} · {formatCurrency(peak.value)}
        </p>
      </div>
    </Card>
  )
}

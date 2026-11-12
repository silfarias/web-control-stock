import { useEffect, useState } from 'react'
import { formatTime } from '@/lib/utils/format'

export function HeaderClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const label = formatTime(now)

  return (
    <time
      dateTime={now.toISOString()}
      className="hidden shrink-0 whitespace-nowrap tabular-nums text-sm leading-none text-muted sm:block"
      aria-label={`Hora actual: ${label}`}
    >
      {label}
    </time>
  )
}

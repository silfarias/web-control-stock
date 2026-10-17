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

  return (
    <time
      dateTime={now.toISOString()}
      className="hidden tabular-nums text-sm text-muted sm:block"
      aria-label={`Hora actual: ${formatTime(now)}`}
    >
      {formatTime(now)}
    </time>
  )
}

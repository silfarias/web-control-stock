import { useEffect, useRef, type RefObject } from 'react'

type UseQuantityHotkeysOptions = {
  enabled: boolean
  itemCount: number
  selectedIndex: number | null
  getQuantity: (index: number) => string
  setQuantity: (index: number, value: string) => void
  min?: number
  formRef?: RefObject<HTMLElement | null>
}

function parseQuantity(value: string, min: number) {
  if (!/^\d+$/.test(value.trim())) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < min) return null
  return n
}

function shouldIgnoreTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  // El propio QuantityInput ya maneja +/-; evitamos doble incremento.
  if (target.closest('[data-qty-input]')) return true
  if (target.closest('[role="dialog"]')) return true
  if (target.matches('textarea')) return true
  if (target.matches('input, select, [contenteditable="true"]')) return true
  return false
}

/**
 * `+` / `-` ajustan la cantidad del ítem seleccionado (o el último)
 * sin estar necesariamente dentro del input de cantidad.
 */
export function useQuantityHotkeys({
  enabled,
  itemCount,
  selectedIndex,
  getQuantity,
  setQuantity,
  min = 1,
  formRef,
}: UseQuantityHotkeysOptions) {
  const getQuantityRef = useRef(getQuantity)
  const setQuantityRef = useRef(setQuantity)
  const selectedRef = useRef(selectedIndex)
  const countRef = useRef(itemCount)

  getQuantityRef.current = getQuantity
  setQuantityRef.current = setQuantity
  selectedRef.current = selectedIndex
  countRef.current = itemCount

  useEffect(() => {
    if (!enabled) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key !== '+' && event.key !== '-' && event.key !== '=') return
      if (shouldIgnoreTarget(event.target)) return

      const count = countRef.current
      if (count <= 0) return

      if (formRef?.current) {
        const active = document.activeElement
        if (
          active instanceof HTMLElement &&
          !formRef.current.contains(active) &&
          active !== document.body
        ) {
          return
        }
      }

      const selected = selectedRef.current
      const index =
        selected != null && selected >= 0 && selected < count ? selected : count - 1

      const current = parseQuantity(getQuantityRef.current(index), min) ?? min
      const next = event.key === '-' ? current - 1 : current + 1
      event.preventDefault()
      setQuantityRef.current(index, String(Math.max(min, next)))
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, formRef, min])
}

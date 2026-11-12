import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext } from '@/features/theme/context/theme-context'
import type { Theme } from '@/features/theme/types'
import {
  applyThemeToDocument,
  resolveInitialTheme,
  storeTheme,
} from '@/features/theme/theme-storage'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = resolveInitialTheme()
    applyThemeToDocument(initial)
    return initial
  })

  useEffect(() => {
    applyThemeToDocument(theme)
    storeTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

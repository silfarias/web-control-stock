import type { Theme } from '@/features/theme/types'

export const THEME_STORAGE_KEY = 'wcs.theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignorar cuotas / modo privado.
  }
}

/** Aplica la clase `.dark` y `color-scheme` en `<html>` (fuente única de verdad visual). */
export function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? 'light'
}

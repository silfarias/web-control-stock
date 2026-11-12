import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/features/theme/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <Sun className="size-[18px]" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  )
}

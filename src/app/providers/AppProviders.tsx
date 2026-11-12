import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/Sonner'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { SucursalProvider } from '@/features/sucursales/context/SucursalProvider'
import { ThemeProvider } from '@/features/theme/context/ThemeProvider'
import { normalizeApiError } from '@/lib/api/errors'

function shouldRetryQuery(failureCount: number, error: unknown) {
  const status = normalizeApiError(error).status
  if (status === 401 || status === 403 || status === 404) return false
  return failureCount < 1
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SucursalProvider>
            <TooltipProvider delayDuration={250}>
              {children}
              <Toaster />
            </TooltipProvider>
          </SucursalProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

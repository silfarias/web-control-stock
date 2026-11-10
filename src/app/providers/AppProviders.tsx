import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/Sonner'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/context/AuthProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={250}>
          {children}
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

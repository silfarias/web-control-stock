import { createContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastInput = {
  title: string
  description?: string
  tone?: ToastTone
}

export type ToastContextValue = {
  pushToast: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

import { toast } from 'sonner'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastInput = {
  title: string
  description?: string
  tone?: ToastTone
}

export function useToast() {
  return {
    pushToast({ title, description, tone = 'info' }: ToastInput) {
      const options = description ? { description } : undefined

      if (tone === 'success') {
        toast.success(title, options)
        return
      }

      if (tone === 'error') {
        toast.error(title, options)
        return
      }

      toast.info(title, options)
    },
  }
}

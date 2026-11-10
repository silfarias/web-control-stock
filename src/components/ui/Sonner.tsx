import type { CSSProperties } from 'react'
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from 'lucide-react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors
      icons={{
        success: <CircleCheck className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="size-4" />,
        loading: <LoaderCircle className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--surface)',
          '--normal-text': 'var(--text-primary)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--success-soft)',
          '--success-text': 'var(--success-ink)',
          '--success-border': 'color-mix(in srgb, var(--success) 28%, transparent)',
          '--error-bg': 'var(--error-soft)',
          '--error-text': 'var(--error-ink)',
          '--error-border': 'color-mix(in srgb, var(--error) 28%, transparent)',
          '--info-bg': 'var(--info-soft)',
          '--info-text': 'var(--info-ink)',
          '--info-border': 'color-mix(in srgb, var(--info) 28%, transparent)',
          '--warning-bg': 'var(--warning-soft)',
          '--warning-text': 'var(--warning-ink)',
          '--warning-border': 'color-mix(in srgb, var(--warning) 28%, transparent)',
          '--border-radius': '1rem',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:shadow-none group-[.toaster]:font-sans',
          title: 'group-[.toast]:text-sm group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-sm group-[.toast]:opacity-90',
          success: 'group-[.toaster]:bg-success-soft group-[.toaster]:text-success-ink group-[.toaster]:border-success/30',
          error: 'group-[.toaster]:bg-error-soft group-[.toaster]:text-error-ink group-[.toaster]:border-error/30',
          info: 'group-[.toaster]:bg-info-soft group-[.toaster]:text-info-ink group-[.toaster]:border-info/30',
          warning:
            'group-[.toaster]:bg-warning-soft group-[.toaster]:text-warning-ink group-[.toaster]:border-warning/30',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-surface-muted group-[.toast]:text-muted',
          closeButton:
            'group-[.toast]:border-border group-[.toast]:bg-surface group-[.toast]:text-muted',
        },
      }}
      {...props}
    />
  )
}

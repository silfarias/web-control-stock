import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLogin } from '@/features/auth/hooks/use-login'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login-schema'
import { getAuthErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const busy = isSubmitting || loginMutation.isPending
  const passwordField = register('password')

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await loginMutation.mutateAsync(values)
      const redirectTo =
        typeof location.state === 'object' &&
        location.state !== null &&
        'from' in location.state &&
        typeof location.state.from === 'string'
          ? location.state.from
          : '/'
      void navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        disabled={busy}
        error={errors.email?.message}
        {...register('email')}
      />

      <label className="flex w-full flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          Contraseña
          <span className="text-error"> *</span>
        </span>
        <div className="relative">
          <input
            {...passwordField}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            disabled={busy}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={cn(
              'h-11 w-full rounded-xl border border-border bg-surface py-0 pr-12 pl-3.5 text-sm text-foreground transition-colors placeholder:text-muted',
              'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
              'disabled:cursor-not-allowed disabled:opacity-60',
              errors.password &&
                'border-error focus-visible:border-error focus-visible:ring-error/20',
            )}
          />
          <button
            type="button"
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={busy}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password?.message ? (
          <span id="password-error" className="text-xs text-error-ink" role="alert">
            {errors.password.message}
          </span>
        ) : null}
      </label>

      {formError ? (
        <div
          className="rounded-xl border border-error/20 bg-error-soft px-3.5 py-3 text-sm text-error-ink"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Ingresando…
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  )
}

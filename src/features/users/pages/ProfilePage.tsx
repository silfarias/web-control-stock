import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getRoleLabel } from '@/features/auth/utils/role-label'
import { useUpdateUser } from '@/features/users/hooks/use-user-mutations'
import {
  PASSWORD_HINT,
  profileFormSchema,
  toUpdateProfileRequest,
  userToProfileFormValues,
  type ProfileFormValues,
} from '@/features/users/schemas/user-schema'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { pushToast } = useToast()
  const updateMutation = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: user
      ? userToProfileFormValues(user)
      : { nombre: '', email: '', password: '', confirmPassword: '' },
  })

  const userId = user?.id
  const userNombre = user?.nombre ?? ''
  const userEmail = user?.email ?? ''

  // Solo resetear cuando cambian los datos persistidos (no en cada nueva referencia de `user`).
  useEffect(() => {
    if (userId == null) return
    reset(
      userToProfileFormValues({
        nombre: userNombre,
        email: userEmail,
      }),
    )
  }, [userId, userNombre, userEmail, reset])

  const values = watch()

  const hasChanges = useMemo(() => {
    if (userId == null) return false
    return (
      values.nombre.trim() !== userNombre.trim() ||
      values.email.trim().toLowerCase() !== userEmail.trim().toLowerCase() ||
      values.password.length > 0 ||
      values.confirmPassword.length > 0
    )
  }, [
    userId,
    userNombre,
    userEmail,
    values.nombre,
    values.email,
    values.password,
    values.confirmPassword,
  ])

  const busy = isSubmitting || updateMutation.isPending
  const canSave = hasChanges && !busy

  const onSubmit = handleSubmit(async (formValues) => {
    if (!user) return

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload: toUpdateProfileRequest(formValues),
      })
      const nextUser = await refreshUser()
      reset(userToProfileFormValues(nextUser))
      pushToast({
        title: 'Perfil actualizado',
        description: 'Tus datos se guardaron correctamente.',
        tone: 'success',
      })
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  if (!user) {
    return (
      <Card className="px-6 py-16 text-center">
        <p className="text-sm font-medium">No hay sesión activa.</p>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <p className="text-sm text-muted">
        Actualizá tu nombre, email o contraseña. El rol solo lo gestiona un administrador.
      </p>

      <Card className="p-5 sm:p-6">
        <dl className="mb-5 grid gap-1 border-b border-border pb-5 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted">Rol</dt>
            <dd className="font-medium">{getRoleLabel(user.role)}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted">ID</dt>
            <dd className="font-medium tabular-nums">{user.id}</dd>
          </div>
        </dl>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Nombre</span>
            <Input
              autoComplete="name"
              aria-invalid={errors.nombre ? true : undefined}
              className={cn(errors.nombre && 'border-error')}
              disabled={busy}
              {...register('nombre')}
            />
            {errors.nombre?.message ? (
              <p className="text-xs text-error-ink">{errors.nombre.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <Input
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              className={cn(errors.email && 'border-error')}
              disabled={busy}
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="text-xs text-error-ink">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Nueva contraseña (opcional)</span>
            <Input
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              className={cn(errors.password && 'border-error')}
              disabled={busy}
              {...register('password')}
            />
            {errors.password?.message ? (
              <p className="text-xs text-error-ink">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-muted">{PASSWORD_HINT}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Confirmar nueva contraseña</span>
            <Input
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              className={cn(errors.confirmPassword && 'border-error')}
              disabled={busy}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword?.message ? (
              <p className="text-xs text-error-ink">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {errors.root?.message ? (
            <p className="rounded-xl bg-error-soft px-3 py-2 text-sm text-error-ink" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={!canSave}
              onClick={() => reset(userToProfileFormValues(user))}
            >
              Descartar
            </Button>
            <Button type="submit" disabled={!canSave}>
              {busy ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

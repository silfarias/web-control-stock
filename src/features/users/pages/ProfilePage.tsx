import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
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

type ProfileBaseline = { userId: number; nombre: string; email: string }

function hasProfileChanges(values: ProfileFormValues, baseline: ProfileBaseline | null) {
  if (!baseline) return false
  return (
    values.nombre.trim() !== baseline.nombre.trim() ||
    values.email.trim().toLowerCase() !== baseline.email.trim().toLowerCase() ||
    values.password.length > 0 ||
    values.confirmPassword.length > 0
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, refreshUser, endSessionLocally } = useAuth()
  const { pushToast } = useToast()
  const updateMutation = useUpdateUser()
  const [baseline, setBaseline] = useState<ProfileBaseline | null>(null)
  const [dirty, setDirty] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { nombre: '', email: '', password: '', confirmPassword: '' },
  })

  // Sincronizar baseline al cargar el usuario (sin effect, para evitar resets en cada render).
  if (user && baseline?.userId !== user.id) {
    setBaseline({ userId: user.id, nombre: user.nombre, email: user.email })
    reset(userToProfileFormValues(user))
    setDirty(false)
  }

  const busy = isSubmitting || updateMutation.isPending
  const canSave = dirty && !busy

  async function submitProfile(formValues: ProfileFormValues) {
    if (!user) return

    const passwordChanged = formValues.password.trim().length > 0

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload: toUpdateProfileRequest(formValues),
      })

      if (passwordChanged) {
        pushToast({
          title: 'Contraseña actualizada',
          description: 'Por seguridad, volvé a iniciar sesión.',
          tone: 'success',
        })
        await endSessionLocally()
        void navigate('/login', { replace: true })
        return
      }

      const nextUser = await refreshUser()
      setBaseline({ userId: nextUser.id, nombre: nextUser.nombre, email: nextUser.email })
      reset(userToProfileFormValues(nextUser))
      setDirty(false)
      pushToast({
        title: 'Perfil actualizado',
        description: 'Tus datos se guardaron correctamente.',
        tone: 'success',
      })
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  }

  function onFieldChange(patch: Partial<ProfileFormValues>) {
    const nextValues = { ...getValues(), ...patch } as ProfileFormValues
    setDirty(hasProfileChanges(nextValues, baseline))
  }

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
        </dl>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            void handleSubmit(submitProfile)(event)
          }}
          noValidate
        >
          <Controller
            name="nombre"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="text-sm font-medium">Nombre</span>
                <Input
                  autoComplete="name"
                  aria-invalid={errors.nombre ? true : undefined}
                  className={cn(errors.nombre && 'border-error')}
                  disabled={busy}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(event) => {
                    field.onChange(event)
                    onFieldChange({ nombre: event.target.value })
                  }}
                />
                {errors.nombre?.message ? (
                  <p className="text-xs text-error-ink">{errors.nombre.message}</p>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="text-sm font-medium">Email</span>
                <Input
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  className={cn(errors.email && 'border-error')}
                  disabled={busy}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(event) => {
                    field.onChange(event)
                    onFieldChange({ email: event.target.value })
                  }}
                />
                {errors.email?.message ? (
                  <p className="text-xs text-error-ink">{errors.email.message}</p>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="text-sm font-medium">Nueva contraseña (opcional)</span>
                <Input
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? true : undefined}
                  className={cn(errors.password && 'border-error')}
                  disabled={busy}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(event) => {
                    field.onChange(event)
                    onFieldChange({ password: event.target.value })
                  }}
                />
                {errors.password?.message ? (
                  <p className="text-xs text-error-ink">{errors.password.message}</p>
                ) : (
                  <p className="text-xs text-muted">{PASSWORD_HINT}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="text-sm font-medium">Confirmar nueva contraseña</span>
                <Input
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  className={cn(errors.confirmPassword && 'border-error')}
                  disabled={busy}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(event) => {
                    field.onChange(event)
                    onFieldChange({ confirmPassword: event.target.value })
                  }}
                />
                {errors.confirmPassword?.message ? (
                  <p className="text-xs text-error-ink">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
            )}
          />

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
              onClick={() => {
                if (!baseline) return
                reset(
                  userToProfileFormValues({
                    nombre: baseline.nombre,
                    email: baseline.email,
                  }),
                )
                setDirty(false)
              }}
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

import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import {
  createUserFormSchema,
  editUserFormSchema,
  emptyCreateUserFormValues,
  PASSWORD_HINT,
  userToEditFormValues,
  type CreateUserFormValues,
  type EditUserFormValues,
} from '@/features/users/schemas/user-schema'
import type { Usuario } from '@/features/users/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Usuario | null
  submitting?: boolean
  isSelf?: boolean
  onSubmitCreate?: (values: CreateUserFormValues) => Promise<void>
  onSubmitEdit: (values: EditUserFormValues) => Promise<void>
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-[#c5d0c8] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  submitting = false,
  isSelf = false,
  onSubmitCreate,
  onSubmitEdit,
}: UserFormDialogProps) {
  if (!open) return null

  return (
    <UserFormDialogContent
      key={user?.id ?? 'new'}
      user={user ?? null}
      submitting={submitting}
      isSelf={isSelf}
      onOpenChange={onOpenChange}
      onSubmitCreate={onSubmitCreate}
      onSubmitEdit={onSubmitEdit}
    />
  )
}

type ContentProps = {
  user: Usuario | null
  submitting: boolean
  isSelf: boolean
  onOpenChange: (open: boolean) => void
  onSubmitCreate?: (values: CreateUserFormValues) => Promise<void>
  onSubmitEdit: (values: EditUserFormValues) => Promise<void>
}

function UserFormDialogContent({
  user,
  submitting,
  isSelf,
  onOpenChange,
  onSubmitCreate,
  onSubmitEdit,
}: ContentProps) {
  if (user) {
    return (
      <EditUserForm
        user={user}
        submitting={submitting}
        isSelf={isSelf}
        onOpenChange={onOpenChange}
        onSubmit={onSubmitEdit}
      />
    )
  }

  if (!onSubmitCreate) return null

  return (
    <CreateUserForm
      submitting={submitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmitCreate}
    />
  )
}

function CreateUserForm({
  submitting,
  onOpenChange,
  onSubmit,
}: {
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateUserFormValues) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: emptyCreateUserFormValues,
  })

  const busy = submitting || isSubmitting

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title="Nuevo usuario"
      description="El usuario podrá iniciar sesión con el email y la contraseña indicados."
      className="max-w-lg"
      footer={
        <FormFooter busy={busy} onCancel={() => onOpenChange(false)} submitLabel="Crear usuario" />
      }
    >
      <form id="user-form" className="space-y-4" onSubmit={submit} noValidate>
        <UserFields
          register={register}
          errors={errors}
          requiredPassword
        />
        {errors.root?.message ? (
          <p className="rounded-xl bg-error-soft px-3 py-2 text-sm text-error-ink" role="alert">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Dialog>
  )
}

function EditUserForm({
  user,
  submitting,
  isSelf,
  onOpenChange,
  onSubmit,
}: {
  user: Usuario
  submitting: boolean
  isSelf: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: EditUserFormValues) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: userToEditFormValues(user),
  })

  const busy = submitting || isSubmitting

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title="Editar usuario"
      description={
        isSelf
          ? 'Estás editando tu propia cuenta. Si cambiás el rol a Empleado, perderás acceso a funciones de administrador.'
          : 'Actualizá los datos del usuario. Dejá la contraseña vacía para no modificarla.'
      }
      className="max-w-lg"
      footer={
        <FormFooter busy={busy} onCancel={() => onOpenChange(false)} submitLabel="Guardar cambios" />
      }
    >
      <form id="user-form" className="space-y-4" onSubmit={submit} noValidate>
        <UserFields
          register={register}
          errors={errors}
          requiredPassword={false}
        />
        {errors.root?.message ? (
          <p className="rounded-xl bg-error-soft px-3 py-2 text-sm text-error-ink" role="alert">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Dialog>
  )
}

function FormFooter({
  busy,
  onCancel,
  submitLabel,
}: {
  busy: boolean
  onCancel: () => void
  submitLabel: string
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
        Cancelar
      </Button>
      <Button type="submit" form="user-form" disabled={busy}>
        {busy ? 'Guardando…' : submitLabel}
      </Button>
    </div>
  )
}

type SharedFields = {
  nombre: string
  email: string
  password: string
  confirmPassword: string
  role: 'ADMIN' | 'EMPLEADO'
}

function UserFields({
  register,
  errors,
  requiredPassword,
}: {
  register: UseFormRegister<SharedFields>
  errors: FieldErrors<SharedFields>
  requiredPassword: boolean
}) {
  return (
    <>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Nombre</span>
        <Input
          autoComplete="name"
          aria-invalid={errors.nombre ? true : undefined}
          className={cn(errors.nombre && 'border-error')}
          {...register('nombre')}
        />
        {errors.nombre?.message ? (
          <p className="text-xs text-error-ink">{errors.nombre.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <Input
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          className={cn(errors.email && 'border-error')}
          {...register('email')}
        />
        {errors.email?.message ? (
          <p className="text-xs text-error-ink">{errors.email.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Rol</span>
        <select
          className={cn(selectClassName, errors.role && 'border-error')}
          aria-invalid={errors.role ? true : undefined}
          {...register('role')}
        >
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {errors.role?.message ? (
          <p className="text-xs text-error-ink">{errors.role.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          {requiredPassword ? 'Contraseña' : 'Nueva contraseña (opcional)'}
        </span>
        <Input
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? true : undefined}
          className={cn(errors.password && 'border-error')}
          {...register('password')}
        />
        {errors.password?.message ? (
          <p className="text-xs text-error-ink">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-muted">{PASSWORD_HINT}</p>
        )}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          {requiredPassword ? 'Confirmar contraseña' : 'Confirmar nueva contraseña'}
        </span>
        <Input
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          className={cn(errors.confirmPassword && 'border-error')}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword?.message ? (
          <p className="text-xs text-error-ink">{errors.confirmPassword.message}</p>
        ) : null}
      </label>
    </>
  )
}
